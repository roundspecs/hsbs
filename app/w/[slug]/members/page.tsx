"use client";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/useAuth";
import { getWorkspaceMembers, removeWorkspaceMember, addWorkspaceMember } from "@/lib/members";
import { getWorkspaceRoles, Role } from "@/lib/roles";
import { getUsers, UserProfile } from "@/lib/users";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import RequirePermission from "@/components/auth/RequirePermission";
import { EditMemberRolesDialog } from "@/components/workspace/EditMemberRolesDialog";
import { MoreHorizontal, Search, Trash2, UserCog } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type MemberWithProfile = UserProfile & {
    roles: string[];
    joinedAt: any;
};

function MembersContent({ slug }: { slug: string }) {
    const { user } = useAuth();
    const [workspaceId, setWorkspaceId] = useState<string | null>(null);
    const [members, setMembers] = useState<MemberWithProfile[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [editMember, setEditMember] = useState<{ uid: string; name: string; roles: string[] } | null>(null);

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
            }
        };

        findWorkspace();
    }, [slug]);

    const loadData = async () => {
        if (!workspaceId) return;
        setLoading(true);
        try {
            const [membersData, rolesData] = await Promise.all([
                getWorkspaceMembers(workspaceId),
                getWorkspaceRoles(workspaceId),
            ]);

            const uids = membersData.map((m) => m.userUid);
            const profiles = await getUsers(uids);

            const combined = membersData.map((m) => {
                const profile = profiles.find((p) => p.uid === m.userUid);
                return {
                    ...m,
                    uid: m.userUid,
                    name: profile?.name || "Unknown",
                    email: profile?.email || null,
                    photoUrl: profile?.photoUrl || null,
                };
            });

            setMembers(combined);
            setRoles(rolesData);
        } catch (err) {
            console.error("Error loading members:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [workspaceId]);

    const handleRemoveMember = async (uid: string, name: string) => {
        if (!workspaceId) return;
        if (!confirm(`Are you sure you want to remove ${name} from the workspace?`)) return;

        try {
            await removeWorkspaceMember(workspaceId, uid);
            setMembers((prev) => prev.filter((m) => m.uid !== uid));
        } catch (err) {
            console.error("Failed to remove member:", err);
            alert("Failed to remove member");
        }
    };

    const handleUpdateRoles = async (uid: string, newRoles: string[]) => {
        if (!workspaceId) return;
        try {
            await addWorkspaceMember(workspaceId, uid, newRoles);
            setMembers((prev) =>
                prev.map((m) => (m.uid === uid ? { ...m, roles: newRoles } : m))
            );

            // Dispatch event
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("roles:updated"));
            }
        } catch (err) {
            throw err;
        }
    };

    const filteredMembers = members.filter(
        (m) =>
            m.name?.toLowerCase().includes(search.toLowerCase()) ||
            m.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading && !members.length) return <div>Loading...</div>;

    return (
        <div className="max-w-6xl w-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Members</h2>
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search members..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Roles</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredMembers.map((member) => (
                            <TableRow key={member.uid}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={member.photoUrl || ""} />
                                            <AvatarFallback>{member.name?.charAt(0) || "?"}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{member.name}</span>
                                            <span className="text-sm text-muted-foreground">{member.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {member.roles.map((roleId) => {
                                            const role = roles.find((r) => r.id === roleId);
                                            return (
                                                <Badge key={roleId} variant="secondary" className="font-normal">
                                                    {role?.name || roleId}
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {member.joinedAt?.seconds
                                        ? new Date(member.joinedAt.seconds * 1000).toLocaleDateString()
                                        : "—"}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    setEditMember({
                                                        uid: member.uid,
                                                        name: member.name || "Unknown",
                                                        roles: member.roles,
                                                    })
                                                }
                                            >
                                                <UserCog className="mr-2 h-4 w-4" />
                                                Edit Roles
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => handleRemoveMember(member.uid, member.name || "Unknown")}
                                                disabled={member.uid === user?.uid}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Remove Member
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <EditMemberRolesDialog
                open={!!editMember}
                onOpenChange={(open) => !open && setEditMember(null)}
                member={editMember}
                allRoles={roles}
                onSave={handleUpdateRoles}
            />
        </div>
    );
}

export default function MembersPage() {
    const pathname = usePathname();
    const segments = pathname?.split("/").filter(Boolean) ?? [];
    const wIndex = segments.indexOf("w");
    const slug = wIndex >= 0 ? segments[wIndex + 1] : segments[0];

    if (!slug) return null;

    return (
        <RequirePermission workspaceSlug={slug} permission="manageMembers">
            <MembersContent slug={slug} />
        </RequirePermission>
    );
}
