import {
  Package,
  Truck,
  ArrowDownToLine,
  ArrowUpFromLine,
  Plus,
  RefreshCw,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { MetricCard } from "@/components/MetricCard";
import { ZoneCard } from "@/components/ZoneCard";
import { ScheduleItem } from "@/components/ScheduleItem";
import { CapacityChart } from "@/components/CapacityChart";
import { NewScheduleDialog } from "@/components/NewScheduleDialog";

const zones = [
  { name: "Zona Principal", code: "A1", current: 450, capacity: 500, incoming: 12, outgoing: 8 },
  { name: "Zona Refrigerada", code: "A2", current: 180, capacity: 200, incoming: 5, outgoing: 10 },
  { name: "Zona Expedição", code: "B1", current: 120, capacity: 300, incoming: 20, outgoing: 25 },
  { name: "Zona Recebimento", code: "B2", current: 85, capacity: 250, incoming: 15, outgoing: 5 },
  { name: "Zona Reserva", code: "C1", current: 30, capacity: 150, incoming: 0, outgoing: 2 },
];

const schedules = [
  { id: "1", time: "08:30", plate: "ABC-1234", driver: "João Silva", type: "entrada" as const, zone: "A1", pallets: 48, status: "em_andamento" as const },
  { id: "2", time: "09:00", plate: "XYZ-5678", driver: "Maria Santos", type: "saida" as const, zone: "B1", pallets: 32, status: "agendado" as const },
  { id: "3", time: "09:30", plate: "DEF-9012", driver: "Pedro Costa", type: "entrada" as const, zone: "A2", pallets: 24, status: "agendado" as const },
  { id: "4", time: "10:00", plate: "GHI-3456", driver: "Ana Oliveira", type: "saida" as const, zone: "B2", pallets: 56, status: "atrasado" as const },
  { id: "5", time: "07:00", plate: "JKL-7890", driver: "Carlos Ferreira", type: "entrada" as const, zone: "A1", pallets: 40, status: "concluido" as const },
];

const Index = () => {
  const totalCapacity = zones.reduce((acc, z) => acc + z.capacity, 0);
  const totalCurrent = zones.reduce((acc, z) => acc + z.current, 0);
  const totalIncoming = zones.reduce((acc, z) => acc + z.incoming, 0);
  const totalOutgoing = zones.reduce((acc, z) => acc + z.outgoing, 0);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        
        <main className="p-6">
          {/* Page Header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Visão geral do pátio e agendamentos
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </Button>
              <NewScheduleDialog>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Agendamento
                </Button>
              </NewScheduleDialog>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total de Pallets"
              value={totalCurrent.toLocaleString()}
              subtitle={`Capacidade: ${totalCapacity.toLocaleString()}`}
              icon={<Package className="h-6 w-6" />}
              trend={{ value: 5.2, isPositive: true }}
            />
            <MetricCard
              title="Veículos Hoje"
              value="12"
              subtitle="8 entradas • 4 saídas"
              icon={<Truck className="h-6 w-6" />}
            />
            <MetricCard
              title="Entrada Prevista"
              value={totalIncoming}
              subtitle="Pallets agendados"
              icon={<ArrowDownToLine className="h-6 w-6" />}
              variant="success"
            />
            <MetricCard
              title="Saída Prevista"
              value={totalOutgoing}
              subtitle="Pallets agendados"
              icon={<ArrowUpFromLine className="h-6 w-6" />}
              variant="warning"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Chart */}
            <div className="lg:col-span-2">
              <CapacityChart />
            </div>

            {/* Quick Stats */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                Ocupação por Zona
              </h3>
              <div className="space-y-4">
                {zones.slice(0, 4).map((zone) => {
                  const pct = Math.round((zone.current / zone.capacity) * 100);
                  return (
                    <div key={zone.code} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {zone.code} - {zone.name}
                        </span>
                        <span className="font-mono text-sm text-muted-foreground">
                          {pct}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct >= 90
                              ? "bg-destructive"
                              : pct >= 70
                              ? "bg-warning"
                              : "bg-success"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Zones Grid */}
          <div className="my-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Zonas de Armazenamento
              </h2>
              <Button variant="ghost" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {zones.map((zone) => (
                <ZoneCard key={zone.code} {...zone} />
              ))}
            </div>
          </div>

          {/* Schedules */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Agendamentos de Hoje
              </h2>
              <Button variant="link" size="sm" className="text-primary">
                Ver todos →
              </Button>
            </div>
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <ScheduleItem key={schedule.id} {...schedule} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
