import { db } from "@/lib/firebaseConfig";
import { collection, addDoc, serverTimestamp, query, where, getDocs, setDoc, deleteDoc, doc } from "firebase/firestore";

export type JoinRequest = {
    uid: string;
    name: string | null;
    email: string | null;
    message: string | null;
    createdAt: any;
};

export async function createJoinRequest(slug: string, data: JoinRequest) {
    await addDoc(collection(db, `workspaces/${slug}/joinRequests`), {
        ...data,
        createdAt: serverTimestamp(),
    });
}

export async function checkPendingRequest(slug: string, uid: string): Promise<boolean> {
    const requestsRef = collection(db, `workspaces/${slug}/joinRequests`);
    const q = query(requestsRef, where('uid', '==', uid));
    const existingRequests = await getDocs(q);
    return !existingRequests.empty;
}

export async function getJoinRequests(slug: string): Promise<JoinRequest[] & { id: string }[]> {
    const reqSnap = await getDocs(collection(db, `workspaces/${slug}/joinRequests`));
    return reqSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function approveJoinRequest(slug: string, request: { id: string; uid: string }) {
    // add to members subcollection
    await setDoc(doc(db, `workspaces/${slug}/members/${request.uid}`), {
        userUid: request.uid,
        roles: ["default"],
        joinedAt: serverTimestamp(),
    });
    // remove request
    await deleteDoc(doc(db, `workspaces/${slug}/joinRequests/${request.id}`));
}

export async function rejectJoinRequest(slug: string, requestId: string) {
    await deleteDoc(doc(db, `workspaces/${slug}/joinRequests/${requestId}`));
}
