import { BetaAnalyticsDataClient, protos } from '@google-analytics/data';
import { NextResponse } from 'next/server';

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GA_CLIENT_EMAIL || '',
    private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

// Pastikan route selalu dynamic agar data GA4 selalu realtime dan tidak di-cache statis
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Interface untuk struktur data yang dikirim ke Frontend
export interface AnalyticsData {
  title: string;
  path: string;
  users: number;
  views: number;
}

export interface DailyTrendItem {
  date: string;
  label: string;
  users: number;
  views: number;
}

const formatGaDate = (dStr: string) => {
  if (!dStr || dStr.length !== 8) return dStr;
  const year = parseInt(dStr.substring(0, 4), 10);
  const month = parseInt(dStr.substring(4, 6), 10) - 1;
  const day = parseInt(dStr.substring(6, 8), 10);
  const dateObj = new Date(year, month, day);
  return dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

export async function GET() {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const startOfMonth = `${year}-${month}-01`;
    const monthName = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    const periodLabel = `Bulan Ini (${monthName})`;

    // Jalankan query laporan halaman, tren harian bulan ini, dan pengguna realtime secara paralel
    const [pagesResult, dailyResult, realtimeResult] = await Promise.all([
      (analyticsDataClient.runReport as any)({
        property: `properties/${process.env.GA_PROPERTY_ID}`,
        dateRanges: [{ startDate: startOfMonth, endDate: 'today' }],
        dimensions: [{ name: 'pageTitle' }, { name: 'pagePath' }],
        metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        metricAggregations: [protos.google.analytics.data.v1beta.MetricAggregation.TOTAL],
      }),
      (analyticsDataClient.runReport as any)({
        property: `properties/${process.env.GA_PROPERTY_ID}`,
        dateRanges: [{ startDate: startOfMonth, endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
        orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
      }),
      (analyticsDataClient.runRealtimeReport as any)({
        property: `properties/${process.env.GA_PROPERTY_ID}`,
        metrics: [{ name: 'activeUsers' }],
      }).catch((e: unknown) => {
        console.warn('Realtime fetch warning:', e);
        return [{ rows: [] }];
      }),
    ]);

    const pagesResponse: protos.google.analytics.data.v1beta.IRunReportResponse = pagesResult?.[0] || {};
    const dailyResponse: protos.google.analytics.data.v1beta.IRunReportResponse = dailyResult?.[0] || {};
    const realtimeResponse = realtimeResult?.[0] || {};

    // 1. Rincian data per halaman
    const reportData: AnalyticsData[] = pagesResponse.rows?.map((row) => ({
      title: row.dimensionValues?.[0]?.value || 'Tanpa Judul',
      path: row.dimensionValues?.[1]?.value || '/',
      users: parseInt(row.metricValues?.[0]?.value || '0', 10),
      views: parseInt(row.metricValues?.[1]?.value || '0', 10),
    })) || [];

    // 2. Summary deduplikasi 30 hari
    const summaryTotalUsers = parseInt(pagesResponse.totals?.[0]?.metricValues?.[0]?.value || '0', 10);
    const summaryTotalViews = parseInt(pagesResponse.totals?.[0]?.metricValues?.[1]?.value || '0', 10);

    // 3. Tren harian untuk visual diagram (14 hari terakhir)
    const dailyTrends: DailyTrendItem[] = dailyResponse.rows?.map((row) => {
      const dateVal = row.dimensionValues?.[0]?.value || '';
      return {
        date: dateVal,
        label: formatGaDate(dateVal),
        users: parseInt(row.metricValues?.[0]?.value || '0', 10),
        views: parseInt(row.metricValues?.[1]?.value || '0', 10),
      };
    }) || [];

    // 4. Data spesifik hari ini (ambil baris terakhir dari daily trends jika ada)
    const todayTrend = dailyTrends.length > 0 ? dailyTrends[dailyTrends.length - 1] : { users: 0, views: 0 };

    // 5. Pengguna aktif online detik ini (realtime)
    const realtimeUsers = parseInt(realtimeResponse?.rows?.[0]?.metricValues?.[0]?.value || '0', 10);

    return NextResponse.json({
      success: true,
      periodLabel,
      data: reportData,
      summary: {
        totalUsers: summaryTotalUsers,
        totalViews: summaryTotalViews,
      },
      dailyTrends,
      today: {
        users: todayTrend.users,
        views: todayTrend.views,
      },
      realtimeUsers,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('GA4 API Error:', errorMessage);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
