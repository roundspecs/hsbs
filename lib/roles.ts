import { db } from "@/lib/firebaseConfig";
import { doc, setDoc, getDocs, collection, getDoc, deleteDoc } from "firebase/firestore";

export async function createSystemRoles(slug: string) {
    // system roles
    await setDoc(doc(db, `workspaces/${slug}/roles/default`), {
        name: "default",
        isSystemRole: true,
        permissions: ["viewProducts", "viewReports"],
    });
    await setDoc(doc(db, `workspaces/${slug}/roles/admin`), {
        name: "admin",
        isSystemRole: true,
        permissions: ["*"],
    });
}

export type Role = {
    id: string;
    name: string;
    isSystemRole: boolean;
    permissions: string[];
};

export async function getWorkspaceRoles(slug: string): Promise<Role[]> {
    const rolesSnap = await getDocs(collection(db, `workspaces/${slug}/roles`));
    return rolesSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
    }));
}

export async function createRole(slug: string, roleId: string, data: Omit<Role, 'id'>) {
    const roleRef = doc(db, `workspaces/${slug}/roles/${roleId}`);
    const roleSnap = await getDoc(roleRef);
    if (roleSnap.exists()) {
        throw new Error("Role already exists");
    }
    await setDoc(roleRef, data);
}

export async function deleteRole(slug: string, roleId: string) {
    await deleteDoc(doc(db, `workspaces/${slug}/roles/${roleId}`));
}
