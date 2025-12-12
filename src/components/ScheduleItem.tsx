import { Clock, Truck, ArrowRight, CheckCircle2, AlertCircle, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleItemProps {
  id: string;
  time: string;
  plate: string;
  driver: string;
  type: "entrada" | "saida";
  zone: string;
  pallets: number;
  status: "agendado" | "em_andamento" | "concluido" | "atrasado";
  className?: string;
}

const statusConfig = {
  agendado: {
    label: "Agendado",
    icon: Clock,
    color: "bg-muted text-muted-foreground",
  },
  em_andamento: {
    label: "Em andamento",
    icon: Timer,
    color: "bg-primary/15 text-primary",
  },
  concluido: {
    label: "Concluído",
    icon: CheckCircle2,
    color: "bg-success/15 text-success",
  },
  atrasado: {
    label: "Atrasado",
    icon: AlertCircle,
    color: "bg-destructive/15 text-destructive",
  },
};

const typeConfig = {
  entrada: {
    label: "Entrada",
    color: "bg-success/15 text-success border-success/30",
    icon: "↓",
  },
  saida: {
    label: "Saída",
    color: "bg-primary/15 text-primary border-primary/30",
    icon: "↑",
  },
};

export function ScheduleItem({
  time,
  plate,
  driver,
  type,
  zone,
  pallets,
  status,
  className,
}: ScheduleItemProps) {
  const statusInfo = statusConfig[status];
  const typeInfo = typeConfig[type];
  const StatusIcon = statusInfo.icon;

  return (
    <div
      className={cn(
        "group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-card",
        className
      )}
    >
      <div className="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-muted">
        <span className="text-lg font-bold text-foreground">{time.split(":")[0]}</span>
        <span className="text-xs text-muted-foreground">:{time.split(":")[1]}</span>
      </div>

      <div className="flex flex-1 items-center gap-4">
        <div className="flex items-center gap-3">
          <Truck className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-mono font-semibold text-foreground">{plate}</p>
            <p className="text-sm text-muted-foreground">{driver}</p>
          </div>
        </div>

        <ArrowRight className="h-4 w-4 text-muted-foreground/50" />

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-md border px-2 py-1 text-xs font-medium",
              typeInfo.color
            )}
          >
            {typeInfo.icon} {typeInfo.label}
          </span>
          <span className="font-mono text-sm text-muted-foreground">{zone}</span>
        </div>
      </div>

      <div className="text-right">
        <p className="font-semibold text-foreground">{pallets} pallets</p>
        <div className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", statusInfo.color)}>
          <StatusIcon className="h-3 w-3" />
          {statusInfo.label}
        </div>
      </div>
    </div>
  );
}
