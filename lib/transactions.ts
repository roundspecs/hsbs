import { db } from "@/lib/firebaseConfig";
import { collection, doc, runTransaction, serverTimestamp, Timestamp, DocumentReference, query, where, orderBy, getDocs, updateDoc } from "firebase/firestore";

export type TransactionItem = {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
};

export type Transaction = {
    id: string;
    type: "LC" | "OT";
    referenceNumber: string;
    date: Timestamp;
    items: TransactionItem[];
    totalAmount: number;
    createdAt: any;
    createdBy: string;
    surgeonId?: string;
    surgeonName?: string;
    amountPaid: number;
    paymentStatus: 'paid' | 'unpaid';
};

export async function createLCEntry(slug: string, data: {
    referenceNumber: string;
    date: Date;
    items: TransactionItem[];
    totalAmount: number;
    createdBy: string;
}) {
    const transactionRef = doc(db, `workspaces/${slug}/transactions`, `LC-${data.referenceNumber}`);

    await runTransaction(db, async (transaction) => {
        // 1. Uniqueness Check
        const transactionDoc = await transaction.get(transactionRef);
        if (transactionDoc.exists()) {
            throw new Error(`LC Number ${data.referenceNumber} already exists.`);
        }

        // 2. Read all product documents to get current stock
        // We need to do this within the transaction to ensure consistency
        const productReads: { ref: DocumentReference; item: TransactionItem }[] = [];
        for (const item of data.items) {
            const productRef = doc(db, `workspaces/${slug}/products`, item.productId);
            productReads.push({ ref: productRef, item });
        }

        const productDocs = await Promise.all(productReads.map(p => transaction.get(p.ref)));

        // 3. Writes
        // Create Transaction Document
        transaction.set(transactionRef, {
            type: "LC",
            referenceNumber: data.referenceNumber,
            date: data.date, // Firestore handles JS Date objects by converting to Timestamp
            items: data.items,
            totalAmount: data.totalAmount,
            createdAt: serverTimestamp(),
            createdBy: data.createdBy,
        });

        // Update Product Stocks
        productDocs.forEach((docSnap, index) => {
            if (!docSnap.exists()) {
                throw new Error(`Product ${productReads[index].item.productName} (ID: ${productReads[index].item.productId}) not found.`);
            }

            const data = docSnap.data();
            const currentStock = data?.stock || 0;
            const newStock = currentStock + productReads[index].item.quantity;

            transaction.update(productReads[index].ref, {
                stock: newStock
            });
        });
    });
}

export async function createOTEntry(slug: string, data: {
    referenceNumber: string;
    date: Date;
    surgeonId: string;
    surgeonName: string;
    items: TransactionItem[];
    totalAmount: number;
    createdBy: string;
}) {
    const transactionRef = doc(db, `workspaces/${slug}/transactions`, `OT-${data.referenceNumber}`);

    await runTransaction(db, async (transaction) => {
        // 1. Uniqueness Check
        const transactionDoc = await transaction.get(transactionRef);
        if (transactionDoc.exists()) {
            throw new Error(`OT Number ${data.referenceNumber} already exists.`);
        }

        // 2. Read all product documents to get current stock
        const productReads: { ref: DocumentReference; item: TransactionItem }[] = [];
        for (const item of data.items) {
            const productRef = doc(db, `workspaces/${slug}/products`, item.productId);
            productReads.push({ ref: productRef, item });
        }

        const productDocs = await Promise.all(productReads.map(p => transaction.get(p.ref)));

        // 3. Stock Validation and Writes
        // Create Transaction Document
        transaction.set(transactionRef, {
            type: "OT",
            referenceNumber: data.referenceNumber,
            date: data.date,
            surgeonId: data.surgeonId,
            surgeonName: data.surgeonName,
            items: data.items,
            totalAmount: data.totalAmount,
            createdAt: serverTimestamp(),
            createdBy: data.createdBy,
            amountPaid: 0,
            paymentStatus: 'unpaid',
        });

        // Update Product Stocks
        productDocs.forEach((docSnap, index) => {
            const item = productReads[index].item;
            if (!docSnap.exists()) {
                throw new Error(`Product ${item.productName} (ID: ${item.productId}) not found.`);
            }

            const productData = docSnap.data();
            const currentStock = productData?.stock || 0;

            if (currentStock < item.quantity) {
                throw new Error(`Insufficient stock for ${item.productName}. Available: ${currentStock}, Requested: ${item.quantity}`);
            }

            const newStock = currentStock - item.quantity;

            transaction.update(productReads[index].ref, {
                stock: newStock
            });
        });
    });
}

export async function getLCTransactions(slug: string): Promise<Transaction[]> {
    const transactionsRef = collection(db, `workspaces/${slug}/transactions`);
    const q = query(
        transactionsRef,
        where("type", "==", "LC"),
        orderBy("date", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Transaction));
}

export async function getOTTransactions(slug: string): Promise<Transaction[]> {
    const transactionsRef = collection(db, `workspaces/${slug}/transactions`);
    const q = query(
        transactionsRef,
        where("type", "==", "OT"),
        orderBy("date", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Transaction));
}

export async function updateTransactionPayment(slug: string, transactionId: string, amountPaid: number, status: 'paid' | 'unpaid') {
    const transactionRef = doc(db, `workspaces/${slug}/transactions`, transactionId);
    await updateDoc(transactionRef, {
        amountPaid,
        paymentStatus: status
    });
}
