import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 10,
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    paddingBottom: 5,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableCell: {
    fontSize: 9,
  },
  summaryBox: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    marginBottom: 20,
    borderRadius: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontWeight: 'bold',
  },
  summaryValue: {
    color: '#d32f2f',
    fontWeight: 'bold',
  }
});

const ReportDocument = ({ reportType, data, dateRange }: { reportType: string, data: any, dateRange: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>INTER MEDI-A</Text>
        <Text style={styles.subtitle}>Laporan {reportType}</Text>
        <Text>{dateRange}</Text>
        <Text>Dicetak: {new Date().toLocaleDateString('id-ID')}</Text>
      </View>

      {/* Summary Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ringkasan</Text>
        <View style={styles.summaryBox}>
          {Object.entries(data.summary || {}).map(([key, value]: [string, any]) => (
            <View key={key} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{formatLabel(key)}:</Text>
              <Text style={styles.summaryValue}>{formatValue(key, value)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Data Table */}
      {data.tableData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detail Data</Text>
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableRow}>
              {data.tableHeaders.map((header: string, index: number) => (
                <View key={index} style={styles.tableColHeader}>
                  <Text style={styles.tableCellHeader}>{header}</Text>
                </View>
              ))}
            </View>
            
            {/* Data Rows */}
            {data.tableData.slice(0, 30).map((row: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                {data.tableHeaders.map((header: string, colIndex: number) => (
                  <View key={colIndex} style={styles.tableCol}>
                    <Text style={styles.tableCell}>{getRowValue(row, header)}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      )}
    </Page>
  </Document>
);

function formatLabel(key: string): string {
  const labels: { [key: string]: string } = {
    totalTransactions: 'Total Transaksi',
    totalRevenue: 'Total Pendapatan',
    totalServices: 'Total Servis',
    totalProducts: 'Total Produk',
    totalStock: 'Total Stok',
    outOfStock: 'Stok Habis',
    lowStock: 'Stok Menipis',
    avgCost: 'Rata-rata Biaya'
  };
  return labels[key] || key;
}

function formatValue(key: string, value: any): string {
  if (key.includes('Revenue') || key.includes('Cost') || key.includes('Value')) {
    return `Rp ${value.toLocaleString('id-ID')}`;
  }
  return value.toString();
}

function getRowValue(row: any, header: string): string {
  // This would need to be customized based on the specific data structure
  return row[header] || '';
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reportType, data, dateRange } = await request.json();

    const pdfBuffer = await pdf(
      <ReportDocument reportType={reportType} data={data} dateRange={dateRange} />
    ).toBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="laporan-${reportType.toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
