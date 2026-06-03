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
    const url = await htmlToImage.toPng(ref.current, { backgroundColor: '#ffffff' });
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
      <div ref={ref} className="chart-view__canvas chart-view__canvas--bar">
        <ResponsiveContainer width="100%" height="100%" minHeight={280}>
          <BarChart data={chartData} margin={{ top: 12, right: 16, left: 8, bottom: 48 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e0d4" />
            <XAxis dataKey={xKey} tick={{ fill: '#5c5a56', fontSize: 11 }} angle={-25} textAnchor="end" height={60} />
            <YAxis tick={{ fill: '#5c5a56', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: '#ffffff',
                border: '1px solid #8f7120',
                borderRadius: 10,
                padding: '10px 14px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
              }}
              labelStyle={{ color: '#1a1a1a', fontWeight: 700 }}
              itemStyle={{ color: '#8f7120', fontWeight: 600 }}
            />
            <Bar dataKey={yKey} fill="#1a1a1a" stroke="#333" strokeWidth={0.5} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
