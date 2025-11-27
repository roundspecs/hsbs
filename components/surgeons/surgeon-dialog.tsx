"use client";

import { useState, useEffect } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import { Surgeon, addSurgeon, updateSurgeon } from "@/lib/surgeons";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SurgeonDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    surgeon?: Surgeon | null; // If present, edit mode
    slug: string;
    onSuccess?: () => void;
}

export function SurgeonDialog({
    open,
    onOpenChange,
    surgeon,
    slug,
    onSuccess,
}: SurgeonDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Surgeon>>({
        name: "",
        phone: "",
        email: "",
        hospitalAffiliation: "",
    });
    const router = useRouter();

    const isEditMode = !!surgeon;

    useEffect(() => {
        if (surgeon) {
            setFormData({
                name: surgeon.name,
                phone: surgeon.phone || "",
                email: surgeon.email || "",
                hospitalAffiliation: surgeon.hospitalAffiliation || "",
            });
        } else {
            setFormData({
                name: "",
                phone: "",
                email: "",
                hospitalAffiliation: "",
            });
        }
    }, [surgeon, open]);

    const handleSave = async () => {
        if (!formData.name) {
            toast.error("Name is required");
            return;
        }

        setLoading(true);
        try {
            if (isEditMode && surgeon) {
                await updateSurgeon(slug, surgeon.id, {
                    name: formData.name,
                    phone: formData.phone || null,
                    email: formData.email || null,
                    hospitalAffiliation: formData.hospitalAffiliation || null,
                });
                toast.success("Surgeon updated successfully");
            } else {
                await addSurgeon(slug, {
                    name: formData.name,
                    phone: formData.phone || null,
                    email: formData.email || null,
                    hospitalAffiliation: formData.hospitalAffiliation || null,
                    totalCases: 0,
                });
                toast.success("Surgeon added successfully");
            }
            onOpenChange(false);
            router.refresh();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Error saving surgeon:", error);
            toast.error("Failed to save surgeon");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditMode ? "Edit Surgeon" : "Add Surgeon"}</DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? "Update the surgeon's details."
                            : "Enter the details of the new surgeon."}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="name" className="text-sm font-medium">
                            Name
                        </label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="e.g. Dr. John Doe"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="phone" className="text-sm font-medium">
                            Phone
                        </label>
                        <Input
                            id="phone"
                            value={formData.phone || ""}
                            onChange={(e) =>
                                setFormData({ ...formData, phone: e.target.value })
                            }
                            placeholder="e.g. +88017..."
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email || ""}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            placeholder="e.g. doctor@example.com"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="hospital" className="text-sm font-medium">
                            Hospital Affiliation
                        </label>
                        <Input
                            id="hospital"
                            value={formData.hospitalAffiliation || ""}
                            onChange={(e) =>
                                setFormData({ ...formData, hospitalAffiliation: e.target.value })
                            }
                            placeholder="e.g. Dhaka Medical College"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading && <Spinner className="mr-2 h-4 w-4" />}
                        {isEditMode ? "Save Changes" : "Add Surgeon"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
