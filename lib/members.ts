import { db } from "@/lib/firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp, deleteDoc, collection, getDocs } from "firebase/firestore";

export type Member = {
    userUid: string;
    roles: string[];
    joinedAt: any;
};

export async function getWorkspaceMember(slug: string, uid: string) {
    const memberRef = doc(db, `workspaces/${slug}/members/${uid}`);
    const memberSnap = await getDoc(memberRef);
    if (memberSnap.exists()) {
        return memberSnap.data() as Member;
    }
    return null;
}

export async function addWorkspaceMember(slug: string, uid: string, roles: string[]) {
    await setDoc(doc(db, `workspaces/${slug}/members/${uid}`), {
        userUid: uid,
        roles,
        joinedAt: serverTimestamp(),
    });
}

export async function removeWorkspaceMember(slug: string, uid: string) {
    await deleteDoc(doc(db, `workspaces/${slug}/members/${uid}`));
}

export async function getWorkspaceMembers(slug: string) {
    const membersSnap = await getDocs(collection(db, `workspaces/${slug}/members`));
    return membersSnap.docs.map(d => d.data() as Member);
}

export async function isWorkspaceAdmin(slug: string, uid: string): Promise<boolean> {
    const member = await getWorkspaceMember(slug, uid);
    return !!member && Array.isArray(member.roles) && member.roles.includes("admin");
}
