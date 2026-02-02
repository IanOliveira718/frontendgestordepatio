import { useState } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Package,
  Truck,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "sonner";

const movimentacaoData = [
  { name: "Seg", entradas: 45, saidas: 38 },
  { name: "Ter", entradas: 52, saidas: 42 },
  { name: "Qua", entradas: 48, saidas: 51 },
  { name: "Qui", entradas: 61, saidas: 55 },
  { name: "Sex", entradas: 55, saidas: 48 },
  { name: "Sáb", entradas: 32, saidas: 28 },
  { name: "Dom", entradas: 15, saidas: 12 },
];

const ocupacaoData = [
  { name: "00h", ocupacao: 65 },
  { name: "04h", ocupacao: 62 },
  { name: "08h", ocupacao: 70 },
  { name: "12h", ocupacao: 85 },
  { name: "16h", ocupacao: 78 },
  { name: "20h", ocupacao: 72 },
];

const zonaData = [
  { name: "Zona A1", value: 450 },
  { name: "Zona A2", value: 180 },
  { name: "Zona B1", value: 120 },
  { name: "Zona B2", value: 85 },
  { name: "Zona C1", value: 30 },
];

const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))", "hsl(var(--muted))"];

const Reports = () => {
  const [period, setPeriod] = useState("week");

  const handleExport = (type: string) => {
    toast.success(`Relatório ${type} exportado com sucesso!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        
        <main className="p-6">
          {/* Page Header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Relatórios
              </h1>
              <p className="text-sm text-muted-foreground">
                Análises e métricas do pátio
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[150px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mês</SelectItem>
                  <SelectItem value="quarter">Trimestre</SelectItem>
                  <SelectItem value="year">Este Ano</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport("PDF")}>
                <Download className="h-4 w-4" />
                Exportar PDF
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport("Excel")}>
                <Download className="h-4 w-4" />
                Exportar Excel
              </Button>
            </div>
          </div>

          {/* KPIs */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Movimentação Total</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,284</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <span className="text-success">+12.5%</span> vs período anterior
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Veículos Atendidos</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <span className="text-success">+8.2%</span> vs período anterior
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio Operação</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1h 23min</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-success" />
                  <span className="text-success">-5.1%</span> vs período anterior
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ocupação Média</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">72.4%</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-warning" />
                  <span className="text-warning">+3.2%</span> vs período anterior
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Movimentação de Pallets</CardTitle>
                <CardDescription>Entradas e saídas por dia da semana</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={movimentacaoData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }} 
                      />
                      <Bar dataKey="entradas" name="Entradas" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="saidas" name="Saídas" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evolução da Ocupação</CardTitle>
                <CardDescription>Percentual de ocupação ao longo do dia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ocupacaoData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                        formatter={(value) => [`${value}%`, "Ocupação"]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="ocupacao" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Zona</CardTitle>
                <CardDescription>Pallets por zona de armazenamento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={zonaData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {zonaData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {zonaData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                      <span className="text-xs text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Resumo de Operações</CardTitle>
                <CardDescription>Principais indicadores do período</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border p-4">
                    <div className="text-sm text-muted-foreground">Total de Entradas</div>
                    <div className="text-2xl font-bold text-success">308</div>
                    <div className="text-xs text-muted-foreground">pallets recebidos</div>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="text-sm text-muted-foreground">Total de Saídas</div>
                    <div className="text-2xl font-bold text-warning">274</div>
                    <div className="text-xs text-muted-foreground">pallets expedidos</div>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="text-sm text-muted-foreground">Agendamentos Cumpridos</div>
                    <div className="text-2xl font-bold text-primary">94.2%</div>
                    <div className="text-xs text-muted-foreground">taxa de pontualidade</div>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="text-sm text-muted-foreground">Ocorrências</div>
                    <div className="text-2xl font-bold text-destructive">3</div>
                    <div className="text-xs text-muted-foreground">registros no período</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;
