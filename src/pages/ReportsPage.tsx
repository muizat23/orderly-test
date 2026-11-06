import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Download } from 'lucide-react';

export const ReportsPage = () => {
  const [timeRange, setTimeRange] = useState<'Last 30 days' | 'Quarter' | 'Custom'>('Last 30 days');

  const handleExportPDF = () => {
    window.print();
  };

  const topProducts = [
    { name: 'Pour-over Set', revenue: 9420, percentage: 90 },
    { name: 'Hand Grinder', revenue: 6100, percentage: 60 },
    { name: 'Kettle', revenue: 4250, percentage: 42 },
    { name: 'Filter Papers (100)', revenue: 2100, percentage: 22 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#14302b]">Reports & Analytics</h2>
          <p className="text-xs text-[#6b7f7a]">
            Sales performance, top product volume, and fiscal summaries.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleExportPDF}
          className="gap-1.5"
        >
          <Download className="h-3.5 w-3.5 text-[#6b7f7a]" />
          <span>Export PDF / Print</span>
        </Button>
      </div>

      {/* Date Range Selector Bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {(['Last 30 days', 'Quarter', 'Custom'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`rounded-lg border px-3 py-1.5 transition-colors cursor-pointer ${
              timeRange === range
                ? 'border-[#0f6b5c] bg-[#e4f0ed] font-semibold text-[#0f6b5c]'
                : 'border-[#dde4e2] bg-white text-[#14302b] hover:bg-[#f3f5f4]'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* 30-Day Revenue Trend Chart in shadcn Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-bold text-[#14302b]">Revenue Growth Curve</CardTitle>
            <p className="text-xs text-[#6b7f7a]">Gross sales across current billing period</p>
          </div>
          <span className="text-xs font-semibold text-[#2e8b57]">+18.4% vs last period</span>
        </CardHeader>

        <CardContent>
          <div className="flex h-36 items-end gap-3 pt-3">
            {[
              { label: 'W1', h: '40%' },
              { label: 'W2', h: '55%' },
              { label: 'W3', h: '48%' },
              { label: 'W4', h: '70%' },
              { label: 'W5', h: '64%' },
              { label: 'W6', h: '88%' },
              { label: 'W7', h: '76%' },
              { label: 'W8', h: '95%', accent: true },
            ].map((bar, idx) => (
              <div key={idx} className="flex h-full flex-1 flex-col items-center justify-end">
                <div className="flex h-full w-full items-end justify-center">
                  <div
                    style={{ height: bar.h }}
                    className={`w-full rounded-t-sm transition-all ${
                      bar.accent ? 'bg-[#f2a33a]' : 'bg-[#0f6b5c]'
                    }`}
                  />
                </div>
                <span className="mt-1.5 text-[10px] text-[#6b7f7a]">{bar.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Products by Revenue Meters in shadcn Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#6b7f7a]">
            Top products by revenue
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {topProducts.map((p) => (
            <div key={p.name} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#14302b]">{p.name}</span>
                <span className="font-medium text-[#6b7f7a]">${p.revenue.toLocaleString()}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#e4f0ed]">
                <div
                  className="h-full rounded-full bg-[#0f6b5c]"
                  style={{ width: `${p.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
