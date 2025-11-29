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
import { Product, updateProduct } from "@/lib/products";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface EditProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product;
    slug: string;
    onSuccess?: () => void;
}

export function EditProductDialog({
    open,
    onOpenChange,
    product,
    slug,
    onSuccess,
}: EditProductDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Product>>({
        productNumber: "",
        name: "",
        unitPrice: 0,
    });
    const router = useRouter();

    useEffect(() => {
        if (product) {
            setFormData({
                productNumber: product.productNumber,
                name: product.name,
                unitPrice: product.unitPrice,
            });
        }
    }, [product]);

    const handleSave = async () => {
        if (!formData.productNumber || !formData.name) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            await updateProduct(slug, product.id, {
                productNumber: formData.productNumber,
                name: formData.name,
                unitPrice: Number(formData.unitPrice),
            });
            toast.success("Product updated successfully");
            onOpenChange(false);
            router.refresh();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Error updating product:", error);
            toast.error("Failed to update product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Product</DialogTitle>
                    <DialogDescription>
                        Update the product details. Stock cannot be edited directly.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="edit-productNumber" className="text-sm font-medium">
                            Product No
                        </label>
                        <Input
                            id="edit-productNumber"
                            value={formData.productNumber}
                            onChange={(e) =>
                                setFormData({ ...formData, productNumber: e.target.value })
                            }
                            placeholder="e.g. 00-7711-004-10"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="edit-name" className="text-sm font-medium">
                            Name
                        </label>
                        <Input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="e.g. P/S TPR ST, 4 STD"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="edit-unitPrice" className="text-sm font-medium">
                            Unit Price
                        </label>
                        <Input
                            id="edit-unitPrice"
                            type="number"
                            value={formData.unitPrice}
                            onChange={(e) =>
                                setFormData({ ...formData, unitPrice: Number(e.target.value) })
                            }
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
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
