import { useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import * as htmlToImage from 'html-to-image';

interface PieChartViewProps {
  data: Record<string, unknown>[];
  categoryKey: string;
  valueKey: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

export function PieChartView({ data, categoryKey, valueKey }: PieChartViewProps) {
  const ref = useRef<HTMLDivElement>(null);

  const chartData = data.map((row) => ({
    name: String(row[categoryKey] ?? ''),
    value: Number(row[valueKey]) || 0,
  }));

  const capturePng = async () => {
    if (!ref.current) return;
    const url = await htmlToImage.toPng(ref.current, { backgroundColor: '#0f172a' });
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
      <div ref={ref} className="chart-view__canvas">
        <ResponsiveContainer width="100%" height={320}>
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
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
