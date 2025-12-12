import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { hora: "06:00", ocupacao: 65, entrada: 12, saida: 8 },
  { hora: "08:00", ocupacao: 72, entrada: 25, saida: 15 },
  { hora: "10:00", ocupacao: 78, entrada: 18, saida: 10 },
  { hora: "12:00", ocupacao: 75, entrada: 8, saida: 12 },
  { hora: "14:00", ocupacao: 82, entrada: 22, saida: 14 },
  { hora: "16:00", ocupacao: 79, entrada: 15, saida: 18 },
  { hora: "18:00", ocupacao: 74, entrada: 10, saida: 16 },
  { hora: "20:00", ocupacao: 68, entrada: 5, saida: 12 },
];

export function CapacityChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Ocupação do Pátio
          </h3>
          <p className="text-sm text-muted-foreground">
            Movimentação nas últimas 24 horas
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Ocupação %</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Entradas</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorOcupacao" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(217 91% 40%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(217 91% 40%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorEntrada" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 88%)" />
          <XAxis
            dataKey="hora"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(220 10% 45%)", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(220 10% 45%)", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(0 0% 100%)",
              border: "1px solid hsl(220 15% 88%)",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px hsl(220 25% 10% / 0.08)",
            }}
          />
          <Area
            type="monotone"
            dataKey="ocupacao"
            stroke="hsl(217 91% 40%)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorOcupacao)"
          />
          <Area
            type="monotone"
            dataKey="entrada"
            stroke="hsl(142 76% 36%)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorEntrada)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
