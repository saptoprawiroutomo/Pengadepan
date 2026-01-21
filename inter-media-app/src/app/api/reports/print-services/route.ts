import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import ServiceRequest from '@/models/ServiceRequest';

export async function GET(request: NextRequest) {
  try {
    // Temporarily disable auth for testing
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    await connectDB();

    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }

    const matchStage = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    const services = await ServiceRequest.find(matchStage)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const totalServices = services.length;
    const totalRevenue = services.reduce((sum, service) => sum + (service.totalCost || 0), 0);
    const completedServices = services.filter(service => service.status === 'delivered').length;
    const pendingServices = services.filter(service => service.status === 'received').length;

    const dateRange = startDate && endDate 
      ? `${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}`
      : 'Semua Data';

    const printHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Laporan Servis - Inter Medi-A</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .company-name { font-size: 24px; font-weight: bold; }
        .report-title { font-size: 18px; margin-top: 10px; }
        .summary { display: flex; justify-content: space-around; margin: 20px 0; }
        .summary-item { text-align: center; }
        .summary-value { font-size: 20px; font-weight: bold; color: #2563eb; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
        .table th { background-color: #f5f5f5; font-weight: bold; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">INTER MEDI-A</div>
        <div>Printer • Fotocopy • Komputer</div>
        <div class="report-title">LAPORAN SERVIS</div>
        <div>Periode: ${dateRange}</div>
    </div>

    <div class="summary">
        <div class="summary-item">
            <div class="summary-value">${totalServices}</div>
            <div>Total Servis</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">${completedServices}</div>
            <div>Selesai</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">${pendingServices}</div>
            <div>Pending</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">Rp ${totalRevenue.toLocaleString('id-ID')}</div>
            <div>Total Revenue</div>
        </div>
    </div>

    <table class="table">
        <thead>
            <tr>
                <th>No</th>
                <th>Service Code</th>
                <th>Tanggal</th>
                <th>Customer</th>
                <th>Perangkat</th>
                <th>Keluhan</th>
                <th>Status</th>
                <th>Biaya Jasa</th>
                <th>Biaya Part</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            ${services.map((service, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${service.serviceCode}</td>
                    <td>${new Date(service.createdAt).toLocaleDateString('id-ID')}</td>
                    <td>${service.userId?.name || 'N/A'}</td>
                    <td>${service.deviceType}</td>
                    <td>${service.complaint.substring(0, 30)}${service.complaint.length > 30 ? '...' : ''}</td>
                    <td>${service.status.toUpperCase()}</td>
                    <td>Rp ${(service.laborCost || 0).toLocaleString('id-ID')}</td>
                    <td>Rp ${(service.partsCost || 0).toLocaleString('id-ID')}</td>
                    <td>Rp ${(service.totalCost || 0).toLocaleString('id-ID')}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="footer">
        <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
        <p>Inter Medi-A - Laporan Servis</p>
    </div>

    <script>
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>`;

    return new NextResponse(printHTML, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
