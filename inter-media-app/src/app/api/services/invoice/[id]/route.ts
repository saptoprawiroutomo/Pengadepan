import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import ServiceRequest from '@/models/ServiceRequest';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 11,
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
    fontSize: 14,
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
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '30%',
    fontWeight: 'bold',
  },
  value: {
    width: '70%',
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingVertical: 3,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 9,
    color: '#666666',
  }
});

const deviceTypeLabels = {
  printer: 'Printer',
  fotocopy: 'Fotocopy',
  komputer: 'Komputer',
  lainnya: 'Lainnya',
};

const statusLabels = {
  received: 'Diterima',
  checking: 'Pengecekan',
  repairing: 'Perbaikan',
  done: 'Selesai',
  delivered: 'Terkirim',
  cancelled: 'Dibatalkan',
};

const InvoiceDocument = ({ service }: { service: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>INTER MEDI-A</Text>
        <Text style={styles.subtitle}>Invoice Servis</Text>
        <Text>No: {service.serviceCode}</Text>
        <Text>{new Date(service.createdAt).toLocaleDateString('id-ID')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informasi Customer</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Nama:</Text>
          <Text style={styles.value}>{service.userId.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{service.userId.email}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Telepon:</Text>
          <Text style={styles.value}>{service.phone}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Alamat:</Text>
          <Text style={styles.value}>{service.address}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detail Servis</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Jenis Perangkat:</Text>
          <Text style={styles.value}>{deviceTypeLabels[service.deviceType as keyof typeof deviceTypeLabels]}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{statusLabels[service.status as keyof typeof statusLabels]}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Keluhan:</Text>
          <Text style={styles.value}>{service.complaint}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rincian Biaya</Text>
        <View style={styles.costRow}>
          <Text>Biaya Jasa:</Text>
          <Text>Rp {service.laborCost.toLocaleString('id-ID')}</Text>
        </View>
        <View style={styles.costRow}>
          <Text>Biaya Sparepart:</Text>
          <Text>Rp {service.partsCost.toLocaleString('id-ID')}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text>TOTAL:</Text>
          <Text>Rp {service.totalCost.toLocaleString('id-ID')}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Terima kasih telah mempercayakan servis perangkat Anda kepada kami!</Text>
        <Text>Inter Medi-A - Solusi Printer & Komputer Terpercaya</Text>
        <Text>Garansi servis 30 hari</Text>
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
    
    const service = await ServiceRequest.findById(params.id)
      .populate('userId', 'name email phone');

    if (!service) {
      return NextResponse.json({ error: 'Servis tidak ditemukan' }, { status: 404 });
    }

    if (service.totalCost <= 0) {
      return NextResponse.json({ error: 'Invoice belum tersedia' }, { status: 400 });
    }

    const pdfBuffer = await pdf(<InvoiceDocument service={service} />).toBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${service.serviceCode}.pdf"`,
      },
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
