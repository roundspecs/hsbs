"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/useAuth";
import { isWorkspaceAdmin, getWorkspaceMembers } from "@/lib/members";
import { getWorkspaceRoles, createRole, deleteRole, Role } from "@/lib/roles";
import { collection, getDocs } from "firebase/firestore";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import RequirePermission from "@/components/auth/RequirePermission";

function PermissionsContent({ slug }: { slug: string }) {
  const { user } = useAuth();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const findWorkspace = async () => {
      setLoading(true);
      try {
        const wsSnap = await getDocs(collection(db, "workspaces"));
        let foundId: string | null = null;
        for (const wsDoc of wsSnap.docs) {
          const data = wsDoc.data() as any;
          if (data?.slug === slug) {
            foundId = wsDoc.id;
            break;
          }
        }
        setWorkspaceId(foundId);
      } catch (err) {
        console.error("Error finding workspace:", err);
      } finally {
        setLoading(false);
      }
    };

    findWorkspace();
  }, [slug]);

  useEffect(() => {
    if (!workspaceId) return;

    const load = async () => {
      setLoading(true);
      try {
        // check if current user is admin
        if (user) {
          const admin = await isWorkspaceAdmin(workspaceId, user.uid);
          setIsAdmin(admin);
        }

        // load roles
        const rolesList = await getWorkspaceRoles(workspaceId);
        setRoles(rolesList);

        // count members per role
        const members = await getWorkspaceMembers(workspaceId);
        const counts: Record<string, number> = {};

        members.forEach((member) => {
          const memberRoles = member.roles || [];
          memberRoles.forEach((roleId: string) => {
            counts[roleId] = (counts[roleId] || 0) + 1;
          });
        });

        setMemberCounts(counts);
      } catch (err) {
        console.error("Error loading roles:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [workspaceId, user]);

  const handleDelete = async (roleId: string) => {
    if (!workspaceId) return;
    if (!confirm(`Are you sure you want to delete the role "${roleId}"?`)) return;

    try {
      await deleteRole(workspaceId, roleId);
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete role");
    }
  };

  const handleCreateRole = async () => {
    if (!workspaceId || !newRoleName.trim()) return;

    const roleId = newRoleName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    if (!roleId) {
      alert("Please enter a valid role name");
      return;
    }

    setCreating(true);

    try {
      await createRole(workspaceId, roleId, {
        name: roleId,
        isSystemRole: false,
        permissions: [],
      });

      // add to local state
      setRoles((prev) => [
        ...prev,
        {
          id: roleId,
          name: roleId,
          isSystemRole: false,
          permissions: [],
        },
      ]);

      setNewRoleName("");
      setCreateDialogOpen(false);
    } catch (err) {
      console.error("Create role error:", err);
      alert("Failed to create role");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Permissions & Roles</h2>
        {isAdmin && (
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            Create Role
          </Button>
        )}
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Enter a name for the new role. Permissions can be configured after creation.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="role-name" className="text-sm font-medium">
                Role Name
              </label>
              <Input
                id="role-name"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="e.g. Manager, Viewer"
                disabled={creating}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                setNewRoleName("");
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateRole} disabled={creating || !newRoleName.trim()}>
              {creating ? "Creating..." : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!isAdmin && (
        <div className="mb-4 text-sm text-muted-foreground">
          You must be a workspace admin to manage roles.
        </div>
      )}

      {roles.length === 0 ? (
        <div className="rounded-md border p-4">No roles found.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => {
              const canDelete = !role.isSystemRole && isAdmin;
              return (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{memberCounts[role.id] || 0}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!isAdmin}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(role.id)}
                        disabled={!canDelete}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default function PermissionsPage() {
  const pathname = usePathname();
  const segments = pathname?.split("/").filter(Boolean) ?? [];
  const wIndex = segments.indexOf("w");
  const slug = wIndex >= 0 ? segments[wIndex + 1] : segments[0];

  if (!slug) return null;

  return (
    <RequirePermission workspaceSlug={slug} permission="manageRoles">
      <PermissionsContent slug={slug} />
    </RequirePermission>
  );
}
