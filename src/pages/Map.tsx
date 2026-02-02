import { Map as MapIcon, Package, Truck, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { cn } from "@/lib/utils";

const zones = [
  { id: "A1", name: "Zona Principal", type: "storage", current: 450, capacity: 500, status: "normal" },
  { id: "A2", name: "Zona Refrigerada", type: "cold", current: 180, capacity: 200, status: "warning" },
  { id: "B1", name: "Zona Expedição", type: "dispatch", current: 120, capacity: 300, status: "normal" },
  { id: "B2", name: "Zona Recebimento", type: "receiving", current: 85, capacity: 250, status: "normal" },
  { id: "C1", name: "Zona Reserva", type: "reserve", current: 30, capacity: 150, status: "normal" },
  { id: "C2", name: "Zona Avariados", type: "damaged", current: 15, capacity: 50, status: "critical" },
];

const docks = [
  { id: "D1", name: "Doca 1", status: "occupied", vehicle: "ABC-1234", type: "entrada" },
  { id: "D2", name: "Doca 2", status: "free", vehicle: null, type: null },
  { id: "D3", name: "Doca 3", status: "occupied", vehicle: "XYZ-5678", type: "saida" },
  { id: "D4", name: "Doca 4", status: "free", vehicle: null, type: null },
  { id: "D5", name: "Doca 5", status: "maintenance", vehicle: null, type: null },
  { id: "D6", name: "Doca 6", status: "occupied", vehicle: "DEF-9012", type: "entrada" },
];

function ZoneBlock({ zone }: { zone: typeof zones[0] }) {
  const occupancy = Math.round((zone.current / zone.capacity) * 100);
  
  const getStatusColor = () => {
    if (occupancy >= 90) return "bg-destructive/20 border-destructive";
    if (occupancy >= 70) return "bg-warning/20 border-warning";
    return "bg-success/20 border-success";
  };

  const getTypeIcon = () => {
    switch (zone.type) {
      case "cold": return "❄️";
      case "dispatch": return "📤";
      case "receiving": return "📥";
      case "damaged": return "⚠️";
      case "reserve": return "📦";
      default: return "🏭";
    }
  };

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all hover:scale-105 cursor-pointer",
        getStatusColor()
      )}
    >
      <span className="text-2xl mb-2">{getTypeIcon()}</span>
      <span className="font-bold text-foreground">{zone.id}</span>
      <span className="text-xs text-muted-foreground text-center">{zone.name}</span>
      <div className="mt-2 text-center">
        <span className="text-sm font-semibold text-foreground">{occupancy}%</span>
        <div className="text-xs text-muted-foreground">
          {zone.current}/{zone.capacity}
        </div>
      </div>
    </div>
  );
}

function DockBlock({ dock }: { dock: typeof docks[0] }) {
  const getStatusStyle = () => {
    switch (dock.status) {
      case "occupied": return "bg-primary/20 border-primary";
      case "free": return "bg-success/20 border-success";
      case "maintenance": return "bg-muted border-muted-foreground";
      default: return "bg-muted border-border";
    }
  };

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-lg border-2 p-3 transition-all hover:scale-105 cursor-pointer min-h-[100px]",
        getStatusStyle()
      )}
    >
      <span className="font-bold text-foreground">{dock.id}</span>
      <span className="text-xs text-muted-foreground">{dock.name}</span>
      {dock.status === "occupied" && (
        <>
          <div className="mt-2 flex items-center gap-1">
            <Truck className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">{dock.vehicle}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            {dock.type === "entrada" ? (
              <ArrowDownToLine className="h-3 w-3 text-success" />
            ) : (
              <ArrowUpFromLine className="h-3 w-3 text-warning" />
            )}
            <span className="text-xs text-muted-foreground capitalize">{dock.type}</span>
          </div>
        </>
      )}
      {dock.status === "free" && (
        <span className="mt-2 text-xs text-success">Livre</span>
      )}
      {dock.status === "maintenance" && (
        <span className="mt-2 text-xs text-muted-foreground">Manutenção</span>
      )}
    </div>
  );
}

const Map = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        
        <main className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <MapIcon className="h-6 w-6" />
              Mapa do Pátio
            </h1>
            <p className="text-sm text-muted-foreground">
              Visualização em tempo real das zonas e docas
            </p>
          </div>

          {/* Legend */}
          <div className="mb-6 flex flex-wrap gap-4 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-success/50 border border-success" />
              <span className="text-sm text-muted-foreground">Normal (&lt;70%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-warning/50 border border-warning" />
              <span className="text-sm text-muted-foreground">Atenção (70-90%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-destructive/50 border border-destructive" />
              <span className="text-sm text-muted-foreground">Crítico (&gt;90%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-primary/50 border border-primary" />
              <span className="text-sm text-muted-foreground">Doca Ocupada</span>
            </div>
          </div>

          {/* Map Layout */}
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Zones Area */}
            <div className="lg:col-span-3 rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <Package className="h-5 w-5" />
                Zonas de Armazenamento
              </h2>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
                {zones.map((zone) => (
                  <ZoneBlock key={zone.id} zone={zone} />
                ))}
              </div>
            </div>

            {/* Docks Area */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <Truck className="h-5 w-5" />
                Docas
              </h2>
              <div className="grid gap-3 grid-cols-2 lg:grid-cols-1">
                {docks.map((dock) => (
                  <DockBlock key={dock.id} dock={dock} />
                ))}
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-2xl font-bold text-foreground">6</div>
              <div className="text-sm text-muted-foreground">Zonas Ativas</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-2xl font-bold text-foreground">3/6</div>
              <div className="text-sm text-muted-foreground">Docas Ocupadas</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-2xl font-bold text-success">2</div>
              <div className="text-sm text-muted-foreground">Docas Livres</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-2xl font-bold text-warning">1</div>
              <div className="text-sm text-muted-foreground">Em Manutenção</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Map;
