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
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { Role } from "@/lib/roles";

interface EditMemberRolesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member: { uid: string; name: string; roles: string[] } | null;
    allRoles: Role[];
    onSave: (uid: string, newRoles: string[]) => Promise<void>;
}

export function EditMemberRolesDialog({
    open,
    onOpenChange,
    member,
    allRoles,
    onSave,
}: EditMemberRolesDialogProps) {
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (member) {
            setSelectedRoles(member.roles);
        }
    }, [member]);

    const handleSave = async () => {
        if (!member) return;
        setSaving(true);
        try {
            await onSave(member.uid, selectedRoles);
            onOpenChange(false);
        } catch (err) {
            console.error("Failed to save roles:", err);
            alert("Failed to save roles");
        } finally {
            setSaving(false);
        }
    };

    const toggleRole = (roleId: string) => {
        setSelectedRoles((prev) =>
            prev.includes(roleId)
                ? prev.filter((r) => r !== roleId)
                : [...prev, roleId]
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Roles for {member?.name}</DialogTitle>
                    <DialogDescription>
                        Select the roles to assign to this member.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {allRoles.map((role) => (
                        <div key={role.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`role-${role.id}`}
                                checked={selectedRoles.includes(role.id)}
                                onCheckedChange={() => toggleRole(role.id)}
                            />
                            <label
                                htmlFor={`role-${role.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {role.name}
                            </label>
                        </div>
                    ))}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
