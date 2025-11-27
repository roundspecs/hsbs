import { db } from "@/lib/firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

export type Product = {
    id: string;
    productNumber: string;
    name: string;
    unitPrice: number;
    category?: string;
    stock: number;
};

export async function getProducts(slug: string): Promise<Product[]> {
    const productsRef = collection(db, `workspaces/${slug}/products`);
    const snapshot = await getDocs(productsRef);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Product, 'id'>),
    }));
}

export async function addProduct(slug: string, data: Omit<Product, 'id'>) {
    const productsRef = collection(db, `workspaces/${slug}/products`);
    await addDoc(productsRef, {
        ...data,
        createdAt: serverTimestamp(),
    });
}

export async function deleteProduct(slug: string, productId: string) {
    const productRef = doc(db, `workspaces/${slug}/products/${productId}`);
    await deleteDoc(productRef);
}
