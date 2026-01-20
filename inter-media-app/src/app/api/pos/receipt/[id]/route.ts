import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import SalesTransaction from '@/models/SalesTransaction';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontSize: 10,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
    paddingBottom: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: '#CCCCCC',
  },
  total: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#000000',
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 8,
  }
});

const ReceiptDocument = ({ transaction }: { transaction: any }) => (
  <Document>
    <Page size={'A5'} style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>INTER MEDI-A</Text>
        <Text style={styles.subtitle}>Struk Penjualan</Text>
        <Text>No: {transaction.transactionCode}</Text>
        <Text>{new Date(transaction.createdAt).toLocaleString('id-ID')}</Text>
      </View>

      <View>
        {transaction.items.map((item: any, index: number) => (
          <View key={index} style={styles.itemRow}>
            <View style={{ flex: 2 }}>
              <Text>{item.nameSnapshot}</Text>
              <Text>{item.qty} x Rp {item.priceSnapshot.toLocaleString('id-ID')}</Text>
            </View>
            <Text>Rp {item.subtotal.toLocaleString('id-ID')}</Text>
          </View>
        ))}
      </View>

      <View style={styles.total}>
        <View style={styles.row}>
          <Text>TOTAL:</Text>
          <Text>Rp {transaction.total.toLocaleString('id-ID')}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Terima kasih atas kunjungan Anda!</Text>
        <Text>Inter Medi-A - Solusi Printer & Komputer</Text>
      </View>
    </Page>
  </Document>
);

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session || !['admin', 'kasir'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const transaction = await SalesTransaction.findById(params.id)
      .populate('cashierId', 'name');

    if (!transaction) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
    }

    const pdfBuffer = await pdf(<ReceiptDocument transaction={transaction} />).toBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="struk-${transaction.transactionCode}.pdf"`,
      },
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
