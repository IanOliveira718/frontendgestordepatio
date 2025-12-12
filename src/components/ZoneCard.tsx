import { Package, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CapacityGauge } from "./CapacityGauge";

interface ZoneCardProps {
  name: string;
  code: string;
  current: number;
  capacity: number;
  incoming: number;
  outgoing: number;
  className?: string;
}

export function ZoneCard({
  name,
  code,
  current,
  capacity,
  incoming,
  outgoing,
  className,
}: ZoneCardProps) {
  const percentage = (current / capacity) * 100;
  
  const getStatusBadge = () => {
    if (percentage >= 90) return { label: "Crítico", color: "bg-destructive text-destructive-foreground" };
    if (percentage >= 70) return { label: "Alto", color: "bg-warning text-warning-foreground" };
    if (percentage >= 40) return { label: "Normal", color: "bg-success text-success-foreground" };
    return { label: "Baixo", color: "bg-muted text-muted-foreground" };
  };

  const status = getStatusBadge();

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-card-hover",
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{name}</h4>
            <span className="font-mono text-xs text-muted-foreground">{code}</span>
          </div>
        </div>
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", status.color)}>
          {status.label}
        </span>
      </div>

      <CapacityGauge
        current={current}
        total={capacity}
        label="Ocupação"
        className="mb-4"
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2">
          <ArrowDown className="h-4 w-4 text-success" />
          <div>
            <p className="text-xs text-muted-foreground">Entrada</p>
            <p className="font-semibold text-success">{incoming}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
          <ArrowUp className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Saída</p>
            <p className="font-semibold text-primary">{outgoing}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
