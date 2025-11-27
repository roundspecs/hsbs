import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export function usePermission(workspaceSlug: string, requiredPermission: string) {
    const { user, loading: authLoading } = useAuth();
    const [hasPermission, setHasPermission] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;

        if (!user || !workspaceSlug) {
            setHasPermission(false);
            setLoading(false);
            return;
        }

        const checkPermission = async () => {
            setLoading(true);
            try {
                // 1. Get member doc to find roles
                const memberRef = doc(db, `workspaces/${workspaceSlug}/members/${user.uid}`);
                const memberSnap = await getDoc(memberRef);

                if (!memberSnap.exists()) {
                    setHasPermission(false);
                    setLoading(false);
                    return;
                }

                const memberData = memberSnap.data();
                const roles = memberData.roles || [];

                if (!Array.isArray(roles) || roles.length === 0) {
                    setHasPermission(false);
                    setLoading(false);
                    return;
                }

                // 2. Fetch all role documents to aggregate permissions
                const rolePromises = roles.map((roleId) =>
                    getDoc(doc(db, `workspaces/${workspaceSlug}/roles/${roleId}`))
                );

                const roleSnaps = await Promise.all(rolePromises);

                const allPermissions = new Set<string>();

                roleSnaps.forEach((snap) => {
                    if (snap.exists()) {
                        const roleData = snap.data();
                        const perms = roleData.permissions || [];
                        if (Array.isArray(perms)) {
                            perms.forEach((p) => allPermissions.add(p));
                        }
                    }
                });

                // 3. Check for specific permission or wildcard
                if (allPermissions.has("*") || allPermissions.has(requiredPermission)) {
                    setHasPermission(true);
                } else {
                    setHasPermission(false);
                }

            } catch (err) {
                console.error("Error checking permissions:", err);
                setError("Failed to check permissions");
                setHasPermission(false);
            } finally {
                setLoading(false);
            }
        };

        checkPermission();
    }, [user, authLoading, workspaceSlug, requiredPermission]);

    return { hasPermission, loading, error };
}
