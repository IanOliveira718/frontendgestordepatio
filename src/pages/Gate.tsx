import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LogIn, LogOut, Truck, Clock, Search, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface VehicleInYard {
  id: string;
  plate: string;
  driver: string;
  company: string;
  vehicleType: string;
  purpose: string;
  zone: string;
  entryTime: string;
  status: "waiting" | "loading" | "unloading" | "ready";
}

const mockVehiclesInYard: VehicleInYard[] = [
  {
    id: "1",
    plate: "ABC-1234",
    driver: "João Silva",
    company: "Transportadora XYZ",
    vehicleType: "Carreta",
    purpose: "Carregamento",
    zone: "Doca A1",
    entryTime: "08:30",
    status: "loading",
  },
  {
    id: "2",
    plate: "DEF-5678",
    driver: "Maria Santos",
    company: "Logística ABC",
    vehicleType: "Truck",
    purpose: "Descarregamento",
    zone: "Doca B2",
    entryTime: "09:15",
    status: "unloading",
  },
  {
    id: "3",
    plate: "GHI-9012",
    driver: "Carlos Oliveira",
    company: "Express Cargas",
    vehicleType: "VUC",
    purpose: "Coleta",
    zone: "Pátio C",
    entryTime: "10:00",
    status: "waiting",
  },
  {
    id: "4",
    plate: "JKL-3456",
    driver: "Ana Costa",
    company: "Rápido Sul",
    vehicleType: "Bitrem",
    purpose: "Carregamento",
    zone: "Doca A3",
    entryTime: "07:45",
    status: "ready",
  },
];

const statusConfig = {
  waiting: { label: "Aguardando", variant: "secondary" as const, color: "bg-muted" },
  loading: { label: "Carregando", variant: "default" as const, color: "bg-primary" },
  unloading: { label: "Descarregando", variant: "default" as const, color: "bg-accent" },
  ready: { label: "Liberado", variant: "outline" as const, color: "bg-success" },
};

export default function Gate() {
  const [vehiclesInYard, setVehiclesInYard] = useState<VehicleInYard[]>(mockVehiclesInYard);
  const [searchPlate, setSearchPlate] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleInYard | null>(null);

  const handleCheckIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const plate = formData.get("plate") as string;
    
    toast.success(`Check-in realizado com sucesso!`, {
      description: `Veículo ${plate} registrado no sistema.`,
    });
    
    e.currentTarget.reset();
  };

  const handleCheckOut = () => {
    if (!selectedVehicle) {
      toast.error("Selecione um veículo para realizar o check-out.");
      return;
    }

    setVehiclesInYard((prev) => prev.filter((v) => v.id !== selectedVehicle.id));
    toast.success(`Check-out realizado com sucesso!`, {
      description: `Veículo ${selectedVehicle.plate} liberado do pátio.`,
    });
    setSelectedVehicle(null);
    setSearchPlate("");
  };

  const filteredVehicles = vehiclesInYard.filter(
    (v) =>
      v.plate.toLowerCase().includes(searchPlate.toLowerCase()) ||
      v.driver.toLowerCase().includes(searchPlate.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-20">
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold font-display text-foreground">Portaria</h1>
            <p className="text-muted-foreground">
              Controle de entrada e saída de veículos
            </p>
          </div>

          <Tabs defaultValue="checkin" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="checkin" className="gap-2">
                <LogIn className="h-4 w-4" />
                Check-in
              </TabsTrigger>
              <TabsTrigger value="checkout" className="gap-2">
                <LogOut className="h-4 w-4" />
                Check-out
              </TabsTrigger>
            </TabsList>

            <TabsContent value="checkin" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-display">
                      <LogIn className="h-5 w-5 text-primary" />
                      Registrar Entrada
                    </CardTitle>
                    <CardDescription>
                      Preencha os dados do veículo e motorista para liberar a entrada
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCheckIn} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="plate">Placa do Veículo *</Label>
                          <Input
                            id="plate"
                            name="plate"
                            placeholder="ABC-1234"
                            required
                            className="uppercase"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="vehicleType">Tipo de Veículo *</Label>
                          <Select name="vehicleType" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vuc">VUC</SelectItem>
                              <SelectItem value="truck">Truck</SelectItem>
                              <SelectItem value="carreta">Carreta</SelectItem>
                              <SelectItem value="bitrem">Bitrem</SelectItem>
                              <SelectItem value="rodotrem">Rodotrem</SelectItem>
                              <SelectItem value="van">Van</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="driver">Nome do Motorista *</Label>
                          <Input
                            id="driver"
                            name="driver"
                            placeholder="Nome completo"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="document">CPF/CNH *</Label>
                          <Input
                            id="document"
                            name="document"
                            placeholder="000.000.000-00"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="company">Transportadora *</Label>
                          <Input
                            id="company"
                            name="company"
                            placeholder="Nome da empresa"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone</Label>
                          <Input
                            id="phone"
                            name="phone"
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="purpose">Finalidade *</Label>
                          <Select name="purpose" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="loading">Carregamento</SelectItem>
                              <SelectItem value="unloading">Descarregamento</SelectItem>
                              <SelectItem value="pickup">Coleta</SelectItem>
                              <SelectItem value="delivery">Entrega</SelectItem>
                              <SelectItem value="transfer">Transferência</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zone">Zona/Doca Destino</Label>
                          <Select name="zone">
                            <SelectTrigger>
                              <SelectValue placeholder="Definir depois" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="doca-a1">Doca A1</SelectItem>
                              <SelectItem value="doca-a2">Doca A2</SelectItem>
                              <SelectItem value="doca-a3">Doca A3</SelectItem>
                              <SelectItem value="doca-b1">Doca B1</SelectItem>
                              <SelectItem value="doca-b2">Doca B2</SelectItem>
                              <SelectItem value="patio-c">Pátio C</SelectItem>
                              <SelectItem value="patio-d">Pátio D</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea
                          id="notes"
                          name="notes"
                          placeholder="Informações adicionais sobre a carga ou motorista..."
                          rows={3}
                        />
                      </div>

                      <Button type="submit" className="w-full" size="lg">
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Confirmar Check-in
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-display">
                      <Truck className="h-5 w-5 text-primary" />
                      Veículos no Pátio
                    </CardTitle>
                    <CardDescription>
                      {vehiclesInYard.length} veículo(s) atualmente no pátio
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border bg-muted/50 p-3 text-center">
                        <p className="text-2xl font-bold text-primary">{vehiclesInYard.filter(v => v.status === "loading").length}</p>
                        <p className="text-xs text-muted-foreground">Carregando</p>
                      </div>
                      <div className="rounded-lg border bg-muted/50 p-3 text-center">
                        <p className="text-2xl font-bold text-accent">{vehiclesInYard.filter(v => v.status === "unloading").length}</p>
                        <p className="text-xs text-muted-foreground">Descarregando</p>
                      </div>
                      <div className="rounded-lg border bg-muted/50 p-3 text-center">
                        <p className="text-2xl font-bold text-muted-foreground">{vehiclesInYard.filter(v => v.status === "waiting").length}</p>
                        <p className="text-xs text-muted-foreground">Aguardando</p>
                      </div>
                      <div className="rounded-lg border bg-muted/50 p-3 text-center">
                        <p className="text-2xl font-bold text-success">{vehiclesInYard.filter(v => v.status === "ready").length}</p>
                        <p className="text-xs text-muted-foreground">Liberados</p>
                      </div>
                    </div>

                    <div className="max-h-80 space-y-2 overflow-y-auto">
                      {vehiclesInYard.map((vehicle) => (
                        <div
                          key={vehicle.id}
                          className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Truck className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{vehicle.plate}</p>
                              <p className="text-sm text-muted-foreground">{vehicle.driver}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={statusConfig[vehicle.status].variant}>
                              {statusConfig[vehicle.status].label}
                            </Badge>
                            <p className="mt-1 flex items-center justify-end gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {vehicle.entryTime}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="checkout" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-display">
                      <LogOut className="h-5 w-5 text-primary" />
                      Registrar Saída
                    </CardTitle>
                    <CardDescription>
                      Pesquise e selecione o veículo para liberar a saída
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por placa ou motorista..."
                        value={searchPlate}
                        onChange={(e) => setSearchPlate(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border p-2">
                      {filteredVehicles.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                          Nenhum veículo encontrado
                        </p>
                      ) : (
                        filteredVehicles.map((vehicle) => (
                          <div
                            key={vehicle.id}
                            onClick={() => setSelectedVehicle(vehicle)}
                            className={`cursor-pointer rounded-lg border p-3 transition-all ${
                              selectedVehicle?.id === vehicle.id
                                ? "border-primary bg-primary/5 ring-2 ring-primary"
                                : "hover:border-primary/50 hover:bg-muted/50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                  <Truck className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-semibold">{vehicle.plate}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {vehicle.driver} • {vehicle.company}
                                  </p>
                                </div>
                              </div>
                              <Badge variant={statusConfig[vehicle.status].variant}>
                                {statusConfig[vehicle.status].label}
                              </Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-display">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Detalhes do Veículo
                    </CardTitle>
                    <CardDescription>
                      Confirme os dados antes de liberar a saída
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedVehicle ? (
                      <div className="space-y-4">
                        <div className="rounded-lg border bg-muted/30 p-4">
                          <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <Truck className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <p className="text-xl font-bold">{selectedVehicle.plate}</p>
                                <Badge variant={statusConfig[selectedVehicle.status].variant}>
                                  {statusConfig[selectedVehicle.status].label}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="grid gap-3 text-sm">
                            <div className="flex justify-between border-b pb-2">
                              <span className="text-muted-foreground">Motorista</span>
                              <span className="font-medium">{selectedVehicle.driver}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                              <span className="text-muted-foreground">Transportadora</span>
                              <span className="font-medium">{selectedVehicle.company}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                              <span className="text-muted-foreground">Tipo</span>
                              <span className="font-medium">{selectedVehicle.vehicleType}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                              <span className="text-muted-foreground">Finalidade</span>
                              <span className="font-medium">{selectedVehicle.purpose}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                              <span className="text-muted-foreground">Zona/Doca</span>
                              <span className="font-medium">{selectedVehicle.zone}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Hora de Entrada</span>
                              <span className="font-medium">{selectedVehicle.entryTime}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="exitNotes">Observações de Saída</Label>
                          <Textarea
                            id="exitNotes"
                            placeholder="Registre ocorrências ou observações..."
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setSelectedVehicle(null)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar
                          </Button>
                          <Button className="flex-1" onClick={handleCheckOut}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Confirmar Saída
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-64 flex-col items-center justify-center text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                          <Truck className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">
                          Selecione um veículo para visualizar os detalhes
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Histórico de Veículos no Pátio</CardTitle>
                  <CardDescription>
                    Lista completa de veículos atualmente no pátio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Placa</TableHead>
                        <TableHead>Motorista</TableHead>
                        <TableHead>Transportadora</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Finalidade</TableHead>
                        <TableHead>Zona</TableHead>
                        <TableHead>Entrada</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehiclesInYard.map((vehicle) => (
                        <TableRow
                          key={vehicle.id}
                          className="cursor-pointer"
                          onClick={() => setSelectedVehicle(vehicle)}
                        >
                          <TableCell className="font-medium">{vehicle.plate}</TableCell>
                          <TableCell>{vehicle.driver}</TableCell>
                          <TableCell>{vehicle.company}</TableCell>
                          <TableCell>{vehicle.vehicleType}</TableCell>
                          <TableCell>{vehicle.purpose}</TableCell>
                          <TableCell>{vehicle.zone}</TableCell>
                          <TableCell>{vehicle.entryTime}</TableCell>
                          <TableCell>
                            <Badge variant={statusConfig[vehicle.status].variant}>
                              {statusConfig[vehicle.status].label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
