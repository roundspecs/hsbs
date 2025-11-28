"use client";

import { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { Transaction } from '@/lib/transactions';
import InvoiceDocument from './invoice-document';

interface DownloadInvoiceBtnProps {
    transaction: Transaction;
}

export default function DownloadInvoiceBtn({ transaction }: DownloadInvoiceBtnProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <Button variant="outline" disabled>
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
            </Button>
        );
    }

    return (
        <PDFDownloadLink
            document={<InvoiceDocument transaction={transaction} />}
            fileName={`Invoice-${transaction.referenceNumber}.pdf`}
        >
            {({ blob, url, loading, error }) => (
                <Button variant="outline" disabled={loading}>
                    {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="mr-2 h-4 w-4" />
                    )}
                    {loading ? 'Generating PDF...' : 'Download Invoice'}
                </Button>
            )}
        </PDFDownloadLink>
    );
}
