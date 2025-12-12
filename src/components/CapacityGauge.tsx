import { cn } from "@/lib/utils";

interface CapacityGaugeProps {
  current: number;
  total: number;
  label: string;
  className?: string;
}

export function CapacityGauge({ current, total, label, className }: CapacityGaugeProps) {
  const percentage = Math.round((current / total) * 100);
  
  const getStatusColor = () => {
    if (percentage >= 90) return "text-destructive";
    if (percentage >= 70) return "text-warning";
    return "text-success";
  };

  const getProgressColor = () => {
    if (percentage >= 90) return "bg-destructive";
    if (percentage >= 70) return "bg-warning";
    return "bg-success";
  };

  const getTrackColor = () => {
    if (percentage >= 90) return "bg-destructive/20";
    if (percentage >= 70) return "bg-warning/20";
    return "bg-success/20";
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className={cn("text-sm font-bold", getStatusColor())}>
          {percentage}%
        </span>
      </div>
      <div className={cn("h-3 w-full overflow-hidden rounded-full", getTrackColor())}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            getProgressColor()
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{current.toLocaleString()} pallets</span>
        <span>Capacidade: {total.toLocaleString()}</span>
      </div>
    </div>
  );
}
