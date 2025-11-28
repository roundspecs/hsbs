import { db } from "@/lib/firebaseConfig";
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, Timestamp } from "firebase/firestore";
import { Product } from "./products";
import { Transaction } from "./transactions";
import { startOfMonth } from "date-fns";

export type DashboardStats = {
    inventoryValue: number;
    monthlySales: number;
    lowStockItems: Product[];
    totalProducts: number;
    recentActivity: Transaction[];
};

export async function getDashboardStats(slug: string): Promise<DashboardStats> {
    // 1. Fetch Workspace Settings (for lowStockThreshold)
    const workspaceRef = doc(db, "workspaces", slug);
    const workspaceSnap = await getDoc(workspaceRef);
    const lowStockThreshold = workspaceSnap.exists() ? (workspaceSnap.data().lowStockThreshold || 10) : 10;

    // 2. Fetch Products
    const productsRef = collection(db, `workspaces/${slug}/products`);
    const productsSnap = await getDocs(productsRef);
    const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

    const totalProducts = products.length;
    const inventoryValue = products.reduce((sum, p) => sum + (p.stock * p.unitPrice), 0);
    const lowStockItems = products.filter(p => p.stock <= lowStockThreshold);

    // 3. Fetch Recent Activity
    const transactionsRef = collection(db, `workspaces/${slug}/transactions`);
    const recentQuery = query(transactionsRef, orderBy("date", "desc"), limit(5));
    const recentSnap = await getDocs(recentQuery);
    const recentActivity = recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));

    // 4. Calculate Monthly Sales
    const startOfCurrentMonth = startOfMonth(new Date());
    const salesQuery = query(
        transactionsRef,
        where("type", "==", "OT"),
        where("date", ">=", Timestamp.fromDate(startOfCurrentMonth))
    );
    const salesSnap = await getDocs(salesQuery);
    const monthlySales = salesSnap.docs.reduce((sum, doc) => sum + (doc.data().totalAmount || 0), 0);

    return {
        inventoryValue,
        monthlySales,
        lowStockItems,
        totalProducts,
        recentActivity
    };
}
