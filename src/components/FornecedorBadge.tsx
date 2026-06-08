import { Badge } from "@/components/ui/badge";
import { cn }    from "@/lib/utils";

export function FornecedorBadge({ ativo }: { ativo: boolean }) {
  return (
    <Badge variant="outline" className={cn(
      "text-xs font-medium",
      ativo
        ? "bg-green-500/10 text-green-600 border-green-500/30"
        : "bg-muted text-muted-foreground border-border"
    )}>
      {ativo ? "Ativo" : "Inativo"}
    </Badge>
  );
}