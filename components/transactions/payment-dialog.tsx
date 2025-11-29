"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Transaction, updateTransactionPayment } from "@/lib/transactions";
import { usePermission } from "@/lib/usePermission";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface PaymentDialogProps {
    transaction: Transaction | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function PaymentDialog({ transaction, open, onOpenChange, onSuccess }: PaymentDialogProps) {
    const params = useParams();
    const slug = params?.slug as string;
    const { hasPermission, loading: permissionLoading } = usePermission(slug, "managePayments");

    const [amountPaid, setAmountPaid] = useState<number>(0);
    const [markAsPaid, setMarkAsPaid] = useState<boolean>(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (transaction) {
            setAmountPaid(transaction.amountPaid || 0);
            setMarkAsPaid(transaction.paymentStatus === 'paid');
        }
    }, [transaction]);

    // Auto-check logic
    useEffect(() => {
        if (transaction && amountPaid >= transaction.totalAmount) {
            setMarkAsPaid(true);
        }
    }, [amountPaid, transaction]);

    const handleSave = async () => {
        if (!transaction || !slug) return;

        try {
            setSaving(true);
            const status = markAsPaid ? 'paid' : 'unpaid';
            await updateTransactionPayment(slug, transaction.id, amountPaid, status);
            toast.success("Payment updated successfully");
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Error updating payment:", error);
            toast.error("Failed to update payment");
        } finally {
            setSaving(false);
        }
    };

    if (!transaction) return null;

    const isPaid = markAsPaid;
    const isFullAmount = amountPaid >= transaction.totalAmount;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Payment</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2 p-4 bg-muted/50 rounded-lg">
                        <div className="flex justify-between">
                            <span className="text-sm font-medium">Total Bill:</span>
                            <span className="text-sm font-bold">
                                {new Intl.NumberFormat("en-BD", { style: "decimal", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(transaction.totalAmount)}
                            </span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span className="text-sm">Currently Paid:</span>
                            <span className="text-sm">
                                {new Intl.NumberFormat("en-BD", { style: "decimal", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(transaction.amountPaid || 0)}
                            </span>
                        </div>
                        <div className={`flex justify-between font-medium ${isPaid ? 'text-green-600' : 'text-red-600'}`}>
                            <span className="text-sm">Status:</span>
                            <span className="text-sm">{isPaid ? "PAID" : "DUE"}</span>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="amountPaid">Total Amount Received</Label>
                        <Input
                            id="amountPaid"
                            type="number"
                            value={amountPaid}
                            onChange={(e) => setAmountPaid(Number(e.target.value))}
                            disabled={!hasPermission || saving}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="markAsPaid"
                            checked={markAsPaid}
                            onCheckedChange={(checked) => setMarkAsPaid(checked as boolean)}
                            disabled={!hasPermission || saving || isFullAmount}
                        />
                        <Label htmlFor="markAsPaid" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Mark as Payment Complete {amountPaid < transaction.totalAmount && "(Forgive remaining due)"}
                        </Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    {hasPermission && (
                        <Button onClick={handleSave} disabled={saving}>
                            {saving && <Spinner className="mr-2 h-4 w-4" />}
                            Save Changes
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
