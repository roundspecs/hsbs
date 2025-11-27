import { db } from "@/lib/firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";

export type Surgeon = {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    hospitalAffiliation: string | null;
    totalCases: number;
};

export async function getSurgeons(slug: string): Promise<Surgeon[]> {
    const surgeonsRef = collection(db, `workspaces/${slug}/surgeons`);
    const snapshot = await getDocs(surgeonsRef);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Surgeon, 'id'>),
    }));
}

export async function addSurgeon(slug: string, data: Omit<Surgeon, 'id'>) {
    const surgeonsRef = collection(db, `workspaces/${slug}/surgeons`);
    await addDoc(surgeonsRef, {
        ...data,
        createdAt: serverTimestamp(),
    });
}

export async function updateSurgeon(slug: string, surgeonId: string, data: Partial<Surgeon>) {
    const surgeonRef = doc(db, `workspaces/${slug}/surgeons/${surgeonId}`);
    await updateDoc(surgeonRef, data);
}

export async function deleteSurgeon(slug: string, surgeonId: string) {
    const surgeonRef = doc(db, `workspaces/${slug}/surgeons/${surgeonId}`);
    await deleteDoc(surgeonRef);
}
