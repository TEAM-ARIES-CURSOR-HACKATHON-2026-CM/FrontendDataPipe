import { useRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import * as htmlToImage from 'html-to-image';

interface BarChartViewProps {
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
}

export function BarChartView({ data, xKey, yKey }: BarChartViewProps) {
  const ref = useRef<HTMLDivElement>(null);

  const chartData = data.map((row) => ({
    ...row,
    [xKey]: String(row[xKey] ?? ''),
    [yKey]: Number(row[yKey]) || 0,
  }));

  const capturePng = async () => {
    if (!ref.current) return;
    const url = await htmlToImage.toPng(ref.current, { backgroundColor: '#0f172a' });
    const link = document.createElement('a');
    link.download = 'datapipe-barres.png';
    link.href = url;
    link.click();
  };

  return (
    <div className="chart-view">
      <button type="button" className="btn btn--secondary btn--sm" onClick={capturePng}>
        Capturer PNG
      </button>
      <div ref={ref} className="chart-view__canvas">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 12, right: 16, left: 8, bottom: 48 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey={xKey} tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-25} textAnchor="end" height={60} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Bar dataKey={yKey} fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
