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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/useAuth";
import { usePermission } from "@/lib/usePermission";
import { getSurgeons, deleteSurgeon, Surgeon } from "@/lib/surgeons";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import RequirePermission from "@/components/auth/RequirePermission";
import { MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { SurgeonImporter } from "@/components/surgeons/surgeon-importer";
import { SurgeonDialog } from "@/components/surgeons/surgeon-dialog";

function SurgeonsContent({ slug }: { slug: string }) {
    const { user } = useAuth();
    const [surgeons, setSurgeons] = useState<Surgeon[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Dialog states
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingSurgeon, setEditingSurgeon] = useState<Surgeon | null>(null);

    const { hasPermission: canManage } = usePermission(slug, "manageSurgeons");

    const loadSurgeons = async () => {
        setLoading(true);
        try {
            const data = await getSurgeons(slug);
            setSurgeons(data);
        } catch (err) {
            console.error("Error loading surgeons:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (slug) {
            loadSurgeons();
        }
    }, [slug]);

    const handleDeleteSurgeon = async (surgeonId: string) => {
        if (!confirm("Are you sure you want to delete this surgeon?")) return;
        try {
            await deleteSurgeon(slug, surgeonId);
            setSurgeons((prev) => prev.filter((s) => s.id !== surgeonId));
        } catch (err) {
            console.error("Error deleting surgeon:", err);
            alert("Failed to delete surgeon");
        }
    };

    const filteredSurgeons = surgeons.filter(
        (s) =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            (s.phone && s.phone.includes(search))
    );

    return (
        <div className="max-w-6xl w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-lg font-semibold">Surgeons</h2>
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search surgeons..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    {canManage && (
                        <>
                            <SurgeonImporter slug={slug} />
                            <Button onClick={() => setIsAddDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Surgeon
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Hospital</TableHead>
                            <TableHead>Total Cases</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : filteredSurgeons.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    No surgeons found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSurgeons.map((surgeon) => (
                                <TableRow key={surgeon.id}>
                                    <TableCell className="font-medium">
                                        {surgeon.name}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            {surgeon.phone && <span>{surgeon.phone}</span>}
                                            {surgeon.email && <span className="text-muted-foreground">{surgeon.email}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>{surgeon.hospitalAffiliation || "-"}</TableCell>
                                    <TableCell>{surgeon.totalCases}</TableCell>
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
                                                        setEditingSurgeon(surgeon);
                                                        setIsEditDialogOpen(true);
                                                    }}
                                                    disabled={!canManage}
                                                >
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => handleDeleteSurgeon(surgeon.id)}
                                                    disabled={!canManage}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add Dialog */}
            <SurgeonDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                slug={slug}
                onSuccess={loadSurgeons}
            />

            {/* Edit Dialog */}
            {editingSurgeon && (
                <SurgeonDialog
                    open={isEditDialogOpen}
                    onOpenChange={(open) => {
                        setIsEditDialogOpen(open);
                        if (!open) setEditingSurgeon(null);
                    }}
                    surgeon={editingSurgeon}
                    slug={slug}
                    onSuccess={loadSurgeons}
                />
            )}
        </div>
    );
}

export default function SurgeonsPage() {
    const pathname = usePathname();
    const segments = pathname?.split("/").filter(Boolean) ?? [];
    const wIndex = segments.indexOf("w");
    const slug = wIndex >= 0 ? segments[wIndex + 1] : segments[0];

    if (!slug) return null;

    return (
        <RequirePermission workspaceSlug={slug} permission="viewSurgeons">
            <SurgeonsContent slug={slug} />
        </RequirePermission>
    );
}
