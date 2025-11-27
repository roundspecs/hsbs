import { db } from "@/lib/firebaseConfig";
import { collection, getDocs, deleteDoc, doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export type Workspace = {
  name: string;
  slug: string;
  ownerUid?: string;
  createdAt?: any;
};

/**
 * Deletes a workspace and all of its subcollections (roles, members, joinRequests).
 * Use only on the client side with proper security rules.
 */
export async function deleteWorkspace(slug: string) {
  // delete roles
  const rolesSnap = await getDocs(collection(db, `workspaces/${slug}/roles`));
  await Promise.all(rolesSnap.docs.map((d) => deleteDoc(d.ref)));

  // delete members
  const membersSnap = await getDocs(collection(db, `workspaces/${slug}/members`));
  await Promise.all(membersSnap.docs.map((d) => deleteDoc(d.ref)));

  // delete joinRequests
  const requestsSnap = await getDocs(collection(db, `workspaces/${slug}/joinRequests`));
  await Promise.all(requestsSnap.docs.map((d) => deleteDoc(d.ref)));

  // finally delete the workspace document itself
  await deleteDoc(doc(db, "workspaces", slug));
}

export async function getWorkspace(slug: string) {
  const snap = await getDoc(doc(db, "workspaces", slug));
  if (snap.exists()) {
    const data = snap.data() as Workspace;
    return { id: snap.id, ...data };
  }
  return null;
}

export async function getUserWorkspaces(uid: string): Promise<Workspace[]> {
  const wsSnap = await getDocs(collection(db, 'workspaces'));
  const result: Workspace[] = [];

  // check each workspace's members subcollection for current user
  // Note: This is inefficient for large numbers of workspaces. 
  // Ideally, we should store a list of workspace IDs on the user document.
  for (const wsDoc of wsSnap.docs) {
    const memberRef = doc(db, `workspaces/${wsDoc.id}/members/${uid}`);
    const memberSnap = await getDoc(memberRef);
    if (memberSnap.exists()) {
      const data = wsDoc.data();
      result.push({ name: data.name, slug: data.slug });
    }
  }
  return result;
}

export async function createWorkspace(name: string, slug: string, ownerUid: string) {
  const wsRef = doc(db, "workspaces", slug);
  const existing = await getDoc(wsRef);
  if (existing.exists()) {
    throw new Error("Slug already exists");
  }

  await setDoc(wsRef, {
    name,
    slug,
    ownerUid,
    createdAt: serverTimestamp(),
  });
}

export async function updateWorkspaceName(slug: string, name: string) {
  const wsRef = doc(db, "workspaces", slug);
  await updateDoc(wsRef, { name: name.trim() });
}