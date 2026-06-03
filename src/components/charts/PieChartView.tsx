import { useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import * as htmlToImage from 'html-to-image';

interface PieChartViewProps {
  data: Record<string, unknown>[];
  categoryKey: string;
  valueKey: string;
}

const COLORS = ['#1a1a1a', '#3d3d3d', '#5c5c5c', '#7a7a7a', '#999', '#b3b3b3', '#ccc'];

export function PieChartView({ data, categoryKey, valueKey }: PieChartViewProps) {
  const ref = useRef<HTMLDivElement>(null);

  const chartData = data.map((row) => ({
    name: String(row[categoryKey] ?? ''),
    value: Number(row[valueKey]) || 0,
  }));

  const capturePng = async () => {
    if (!ref.current) return;
    const url = await htmlToImage.toPng(ref.current, { backgroundColor: '#ffffff' });
    const link = document.createElement('a');
    link.download = 'datapipe-circulaire.png';
    link.href = url;
    link.click();
  };

  return (
    <div className="chart-view">
      <button type="button" className="btn btn--secondary btn--sm" onClick={capturePng}>
        Capturer PNG
      </button>
      <div ref={ref} className="chart-view__canvas chart-view__canvas--pie">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={110}
              label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#1a1a1a', border: '1px solid #c9a227', borderRadius: 8 }}
            />
            <Legend wrapperStyle={{ color: '#1a1a1a', fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
