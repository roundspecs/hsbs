"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getLCTransactions, Transaction } from "@/lib/transactions";
import RequirePermission from "@/components/auth/RequirePermission";
import { TransactionDetailsDialog } from "@/components/transactions/transaction-details-dialog";

function LCHistoryContent({ slug }: { slug: string }) {
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const data = await getLCTransactions(slug);
                setTransactions(data);
            } catch (error) {
                console.error("Error fetching transactions:", error);
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchTransactions();
    }, [slug]);

    return (
        <div className="max-w-6xl w-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">LC History</h2>
                <Button onClick={() => router.push(`/w/${slug}/inventory/lc-new`)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Entry
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>LC Number</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead className="text-right">Total Amount</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    No LC entries found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell>
                                        {transaction.date ? format(transaction.date.toDate(), "dd MMM yyyy") : "-"}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {transaction.referenceNumber}
                                    </TableCell>
                                    <TableCell>
                                        {transaction.items.length === 1
                                            ? transaction.items[0].productName
                                            : `${transaction.items[0].productName} + ${transaction.items.length - 1} others`}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {new Intl.NumberFormat("en-BD", {
                                            style: "decimal",
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 0,
                                        }).format(transaction.totalAmount)}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedTransaction(transaction);
                                                setDetailsOpen(true);
                                            }}
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <TransactionDetailsDialog
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                transaction={selectedTransaction}
            />
        </div>
    );
}

export default function LCHistoryPage() {
    const pathname = usePathname();
    const segments = pathname?.split("/").filter(Boolean) ?? [];
    const wIndex = segments.indexOf("w");
    const slug = wIndex >= 0 ? segments[wIndex + 1] : segments[0];

    if (!slug) return null;

    return (
        <RequirePermission workspaceSlug={slug} permission="stockIn">
            <LCHistoryContent slug={slug} />
        </RequirePermission>
    );
}
