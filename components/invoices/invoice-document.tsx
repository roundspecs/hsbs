import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { Transaction } from '@/lib/transactions';
import { format } from 'date-fns';

// Define styles
const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 11,
        paddingTop: 30,
        paddingLeft: 40,
        paddingRight: 40,
        paddingBottom: 30,
        lineHeight: 1.5,
        flexDirection: 'column',
    },
    headerContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    companyName: {
        fontSize: 24,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    slogan: {
        fontSize: 10,
        fontStyle: 'italic',
        color: '#555',
        marginBottom: 10,
    },
    otNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 5,
    },
    metadataContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 10,
    },
    metadataColumn: {
        flexDirection: 'column',
    },
    metadataLabel: {
        fontSize: 10,
        color: '#555',
    },
    metadataValue: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    invoiceTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
        letterSpacing: 2,
    },
    tableContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#000',
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        backgroundColor: '#f8f8f8',
        alignItems: 'center',
        height: 24,
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
        minHeight: 24,
    },
    // Column widths
    colProduct: { width: '55%', paddingLeft: 8 },
    colQty: { width: '10%', textAlign: 'center' },
    colPrice: { width: '17.5%', textAlign: 'right', paddingRight: 8 },
    colTotal: { width: '17.5%', textAlign: 'right', paddingRight: 8 },

    tableCell: {
        fontSize: 10,
    },
    tableCellHeader: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    footerContainer: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    totalRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        marginRight: 10,
    },
    totalValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    thankYouMsg: {
        marginTop: 40,
        textAlign: 'center',
        fontSize: 12,
        fontStyle: 'italic',
        color: '#555',
    },
});

// Components
const InvoiceTableHeader = () => (
    <View style={styles.tableHeader} fixed>
        <Text style={[styles.colProduct, styles.tableCellHeader]}>Product Name</Text>
        <Text style={[styles.colQty, styles.tableCellHeader]}>Qty</Text>
        <Text style={[styles.colPrice, styles.tableCellHeader]}>Unit Price</Text>
        <Text style={[styles.colTotal, styles.tableCellHeader]}>Total</Text>
    </View>
);

const InvoiceTableRow = ({ items }: { items: Transaction['items'] }) => {
    return (
        <>
            {items.map((item, index) => (
                <View style={styles.tableRow} key={index}>
                    <Text style={[styles.colProduct, styles.tableCell]}>{item.productName}</Text>
                    <Text style={[styles.colQty, styles.tableCell]}>{item.quantity}</Text>
                    <Text style={[styles.colPrice, styles.tableCell]}>
                        {new Intl.NumberFormat('en-BD', { minimumFractionDigits: 0 }).format(item.unitPrice)}
                    </Text>
                    <Text style={[styles.colTotal, styles.tableCell]}>
                        {new Intl.NumberFormat('en-BD', { minimumFractionDigits: 0 }).format(item.quantity * item.unitPrice)}
                    </Text>
                </View>
            ))}
        </>
    );
};

const InvoiceTableFooter = ({ total }: { total: number }) => (
    <View style={styles.footerContainer}>
        <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total:</Text>
            <Text style={styles.totalValue}>
                Tk. {new Intl.NumberFormat('en-BD', { minimumFractionDigits: 0 }).format(total)}
            </Text>
        </View>
    </View>
);

interface InvoiceDocumentProps {
    transaction: Transaction;
}

const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({ transaction }) => (
    <Document>
        <Page size="A4" style={styles.page} wrap>
            {/* Header */}
            <View style={styles.headerContainer}>
                <Text style={styles.companyName}>M. Rahman & Co.</Text>
                <Text style={styles.slogan}>"Is there any reward for good, other than good"</Text>
                <Text style={styles.otNumber}>OT # {transaction.referenceNumber}</Text>
            </View>

            {/* Metadata */}
            <View style={styles.metadataContainer}>
                <View style={styles.metadataColumn}>
                    <Text style={styles.metadataLabel}>Surgeon Name:</Text>
                    <Text style={styles.metadataValue}>{transaction.surgeonName || 'N/A'}</Text>
                </View>
                <View style={styles.metadataColumn}>
                    <Text style={styles.metadataLabel}>Date:</Text>
                    <Text style={styles.metadataValue}>
                        {transaction.date ? format(transaction.date.toDate(), 'dd MMM yyyy') : '-'}
                    </Text>
                </View>
            </View>

            <Text style={styles.invoiceTitle}>INVOICE</Text>

            {/* Table */}
            <View style={styles.tableContainer}>
                <InvoiceTableHeader />
                <InvoiceTableRow items={transaction.items} />
            </View>

            {/* Footer */}
            <InvoiceTableFooter total={transaction.totalAmount} />

            <Text style={styles.thankYouMsg}>Thank you.</Text>
        </Page>
    </Document>
);

export default InvoiceDocument;
