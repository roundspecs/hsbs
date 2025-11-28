import { db } from "@/lib/firebaseConfig";
import { collection, doc, runTransaction, serverTimestamp, Timestamp, DocumentReference } from "firebase/firestore";

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
