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
import { getWorkspaceRoles, createRole, deleteRole, updateRole, Role } from "@/lib/roles";
import { PERMISSIONS } from "@/lib/permissions";
import { Checkbox } from "@/components/ui/checkbox";
import { collection, getDocs } from "firebase/firestore";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import RequirePermission from "@/components/auth/RequirePermission";
import { MoreHorizontal, Trash2, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function PermissionsContent({ slug }: { slug: string }) {
  const { user } = useAuth();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
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



  const togglePermission = (key: string) => {
    if (!editingRole) return;
    const current = editingRole.permissions;
    const updated = current.includes(key)
      ? current.filter(p => p !== key)
      : [...current, key];
    setEditingRole({ ...editingRole, permissions: updated });
  };

  const handleSavePermissions = async () => {
    if (!workspaceId || !editingRole) return;
    try {
      await updateRole(workspaceId, editingRole.id, { permissions: editingRole.permissions });
      setRoles(prev => prev.map(r => r.id === editingRole.id ? editingRole : r));
      setPermissionsDialogOpen(false);
    } catch (err) {
      console.error("Save permissions error:", err);
      alert("Failed to save permissions");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl w-full">
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

      <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Permissions: {editingRole?.name}</DialogTitle>
            <DialogDescription>
              Manage permissions for this role.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {Object.entries(PERMISSIONS).map(([category, perms]) => (
              <div key={category} className="space-y-3">
                <h3 className="font-semibold capitalize border-b pb-1">{category}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(perms).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`perm-${key}`}
                        checked={editingRole?.permissions.includes(key) || editingRole?.permissions.includes("*")}
                        disabled={editingRole?.permissions.includes("*") && key !== "*"}
                        onCheckedChange={() => togglePermission(key)}
                      />
                      <label
                        htmlFor={`perm-${key}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPermissionsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSavePermissions}>
              Save Permissions
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Members</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => {
                const canDelete = !role.isSystemRole && isAdmin;
                return (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{role.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {role.permissions.includes("*")
                            ? "Full Access"
                            : `${role.permissions.length} permissions`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{memberCounts[role.id] || 0}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingRole(role);
                              setPermissionsDialogOpen(true);
                            }}
                            disabled={!isAdmin}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Edit Permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(role.id)}
                            disabled={!canDelete}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Role
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
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
