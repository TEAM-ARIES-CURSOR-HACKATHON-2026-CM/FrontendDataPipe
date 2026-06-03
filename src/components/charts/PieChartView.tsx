import { useRef } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  type PieLabelRenderProps,
} from 'recharts';
import * as htmlToImage from 'html-to-image';

interface PieTooltipPayload {
  name?: string;
  value?: number;
  payload?: { name?: string; value?: number };
}

interface PieTooltipContentProps {
  active?: boolean;
  payload?: PieTooltipPayload[];
}

interface PieChartViewProps {
  data: Record<string, unknown>[];
  categoryKey: string;
  valueKey: string;
}

/** Palette lisible : tons or / neutres (évite le noir pur sur les infobulles). */
const COLORS = ['#8f7120', '#b8942e', '#5c5a56', '#7a7268', '#a89880', '#3d3d3d', '#d4b86a'];

function formatAmount(value: number): string {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value);
}

function PieTooltipContent({ active, payload }: PieTooltipContentProps) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const name = String(item.name ?? item.payload?.name ?? '—');
  const value = Number(item.value ?? item.payload?.value ?? 0);
  const total = payload.reduce(
    (sum: number, p: PieTooltipPayload) => sum + Number(p.value ?? p.payload?.value ?? 0),
    0,
  );
  const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0';

  return (
    <div className="chart-tooltip chart-tooltip--pie" role="tooltip">
      <span className="chart-tooltip__title">{name}</span>
      <span className="chart-tooltip__value">{formatAmount(value)}</span>
      <span className="chart-tooltip__meta">{percent} % du total</span>
    </div>
  );
}

/** Étiquettes à l’extérieur du camembert (lisibles sur fond blanc). */
function renderPieLabel(props: PieLabelRenderProps) {
  const { name, percent, cx = 0, cy = 0, midAngle = 0, outerRadius = 0 } = props;
  if ((percent ?? 0) < 0.04) return null;

  const RADIAN = Math.PI / 180;
  const radius = Number(outerRadius) + 22;
  const angle = -midAngle * RADIAN;
  const x = Number(cx) + radius * Math.cos(angle);
  const y = Number(cy) + radius * Math.sin(angle);

  return (
    <text
      x={x}
      y={y}
      fill="#1a1a1a"
      textAnchor={x > Number(cx) ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
    >
      {`${name} (${((percent ?? 0) * 100).toFixed(0)} %)`}
    </text>
  );
}

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
        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
          <PieChart margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={95}
              labelLine={{ stroke: '#8f7120', strokeWidth: 1 }}
              label={renderPieLabel}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#fff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              content={<PieTooltipContent />}
              wrapperStyle={{ zIndex: 20, outline: 'none' }}
              cursor={{ fill: 'rgba(184, 148, 46, 0.12)' }}
            />
            <Legend
              wrapperStyle={{ color: '#1a1a1a', fontSize: 12, paddingTop: 8 }}
              formatter={(value) => <span className="chart-legend__text">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
