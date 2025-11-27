import { db } from "@/lib/firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

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