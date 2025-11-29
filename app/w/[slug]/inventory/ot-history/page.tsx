"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Plus, Eye } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { getOTTransactions, Transaction } from "@/lib/transactions";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { TransactionDetailsDialog } from "@/components/transactions/transaction-details-dialog";
import RequirePermission from "@/components/auth/RequirePermission";
import { useRouter, usePathname } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { PaymentDialog } from "@/components/transactions/payment-dialog";

function OTHistoryContent({ slug }: { slug: string }) {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    const fetchTransactions = async () => {
        if (!slug) return;
        try {
            const data = await getOTTransactions(slug);
            setTransactions(data);
        } catch (error) {
            console.error("Error fetching OT transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [slug]);

    return (
        <div className="max-w-6xl w-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">OT History (Stock-Out)</h2>
                <Link href={`/w/${slug}/inventory/ot-new`}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New OT Entry
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>OT Number</TableHead>
                            <TableHead>Surgeon</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead className="text-right">Total Bill</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <Spinner className="mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No OT transactions found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell>
                                        {transaction.date ? format(transaction.date.toDate(), "dd MMM yyyy") : "-"}
                                    </TableCell>
                                    <TableCell className="font-medium">{transaction.referenceNumber}</TableCell>
                                    <TableCell>{transaction.surgeonName || "-"}</TableCell>
                                    <TableCell>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Badge
                                                        className={`cursor-pointer ${transaction.paymentStatus === 'paid'
                                                                ? "bg-green-500 hover:bg-green-600"
                                                                : "bg-red-500 hover:bg-red-600"
                                                            }`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedTransaction(transaction);
                                                            setIsPaymentOpen(true);
                                                        }}
                                                    >
                                                        {transaction.paymentStatus === 'paid'
                                                            ? "PAID"
                                                            : `DUE: ${new Intl.NumberFormat("en-BD", {
                                                                style: "currency",
                                                                currency: "BDT",
                                                            }).format(transaction.totalAmount - (transaction.amountPaid || 0))}`}
                                                    </Badge>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Amount Paid: {new Intl.NumberFormat("en-BD", {
                                                        style: "currency",
                                                        currency: "BDT",
                                                    }).format(transaction.amountPaid || 0)}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {new Intl.NumberFormat("en-BD", {
                                            style: "currency",
                                            currency: "BDT",
                                        }).format(transaction.totalAmount)}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedTransaction(transaction);
                                                setIsDetailsOpen(true);
                                            }}
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <TransactionDetailsDialog
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                transaction={selectedTransaction}
            />
            <PaymentDialog
                open={isPaymentOpen}
                onOpenChange={setIsPaymentOpen}
                transaction={selectedTransaction}
                onSuccess={fetchTransactions}
            />
        </div>
    );
}

export default function OTHistoryPage() {
    const pathname = usePathname();
    const segments = pathname?.split("/").filter(Boolean) ?? [];
    const wIndex = segments.indexOf("w");
    const slug = wIndex >= 0 ? segments[wIndex + 1] : segments[0];

    if (!slug) return null;

    return (
        <RequirePermission workspaceSlug={slug} permission="stockOut">
            <OTHistoryContent slug={slug} />
        </RequirePermission>
    );
}
