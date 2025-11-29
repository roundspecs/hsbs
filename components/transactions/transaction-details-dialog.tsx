"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Transaction } from "@/lib/transactions";
import { format } from "date-fns";
import DownloadInvoiceBtn from "@/components/invoices/download-invoice-btn";

interface TransactionDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transaction: Transaction | null;
}

export function TransactionDetailsDialog({
    open,
    onOpenChange,
    transaction,
}: TransactionDetailsDialogProps) {
    if (!transaction) return null;

    const isOT = transaction.type === "OT";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{isOT ? "OT Entry Details" : "LC Entry Details"}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="text-sm text-muted-foreground">{isOT ? "OT Number" : "LC Number"}</p>
                        <p className="font-medium">{transaction.referenceNumber}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-medium">
                            {transaction.date ? format(transaction.date.toDate(), "dd MMM yyyy") : "-"}
                        </p>
                    </div>
                    {isOT && transaction.surgeonName && (
                        <div className="col-span-2">
                            <p className="text-sm text-muted-foreground">Surgeon</p>
                            <p className="font-medium">{transaction.surgeonName}</p>
                        </div>
                    )}
                </div>

                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product Name</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Unit Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transaction.items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.productName}</TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                    <TableCell className="text-right">
                                        {new Intl.NumberFormat("en-BD", {
                                            style: "decimal",
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 0,
                                        }).format(item.unitPrice)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {new Intl.NumberFormat("en-BD", {
                                            style: "decimal",
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 0,
                                        }).format(item.quantity * item.unitPrice)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow>
                                <TableCell colSpan={3} className="text-right font-bold">
                                    Total Amount
                                </TableCell>
                                <TableCell className="text-right font-bold">
                                    {new Intl.NumberFormat("en-BD", {
                                        style: "decimal",
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                    }).format(transaction.totalAmount)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                {isOT && (
                    <DialogFooter className="sm:justify-start">
                        <DownloadInvoiceBtn transaction={transaction} />
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
