import { useState, useEffect } from "react";
import { Calendar, Truck, Package, MapPin, FileText, Building2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { createAgendamento } from "@/services/agendamentosService";
import { fetchPatios, fetchZonas, PatioAPI, ZonaAPI, TIPO_ZONA_LABELS } from "@/services/patioService";

interface NewScheduleDialogProps {
  children:   React.ReactNode;
  onCreated?: () => void;
}

export function NewScheduleDialog({ children, onCreated }: NewScheduleDialogProps) {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);

  // Pátios e zonas carregados da API
  const [patios,       setPatios]       = useState<PatioAPI[]>([]);
  const [zonas,        setZonas]        = useState<ZonaAPI[]>([]);
  const [loadingPatios, setLoadingPatios] = useState(false);
  const [loadingZonas,  setLoadingZonas]  = useState(false);
  const [patioSelecionado, setPatioSelecionado] = useState<string>("");

  const [formData, setFormData] = useState({
    plate:       "",
    driver:      "",
    type:        "",
    zone:        "",   // armazena o nome da zona (campo que vai para a API)
    date:        "",
    time:        "",
    pallets:     "",
    nota_fiscal: "",
  });

  const [descricoes, setDescricoes] = useState<string[]>([]);

  // ── Carrega pátios quando o dialog abre ───────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setLoadingPatios(true);
    fetchPatios()
      .then(setPatios)
      .catch(() => toast({ title: "Erro", description: "Não foi possível carregar os pátios.", variant: "destructive" }))
      .finally(() => setLoadingPatios(false));
  }, [open]);

  // ── Carrega zonas quando um pátio é selecionado ───────────────────────────
  useEffect(() => {
    if (!patioSelecionado) {
      setZonas([]);
      setFormData((prev) => ({ ...prev, zone: "" }));
      return;
    }
    setLoadingZonas(true);
    setFormData((prev) => ({ ...prev, zone: "" })); // limpa zona anterior
    fetchZonas(parseInt(patioSelecionado))
      .then(setZonas)
      .catch(() => toast({ title: "Erro", description: "Não foi possível carregar as zonas.", variant: "destructive" }))
      .finally(() => setLoadingZonas(false));
  }, [patioSelecionado]);

  // ── Sincroniza descrições com quantidade de pallets ───────────────────────
  useEffect(() => {
    const qtd = parseInt(formData.pallets) || 0;
    setDescricoes((prev) =>
      qtd > prev.length
        ? [...prev, ...Array(qtd - prev.length).fill("")]
        : prev.slice(0, qtd)
    );
  }, [formData.pallets]);

  const setDescricao = (index: number, value: string) =>
    setDescricoes((prev) => prev.map((d, i) => (i === index ? value : d)));

  // ── Validação ──────────────────────────────────────────────────────────────
  const validate = (): string | null => {
    const qtd = parseInt(formData.pallets) || 0;
    if (!patioSelecionado)              return "Selecione um pátio.";
    if (!formData.zone)                 return "Selecione uma zona.";
    if (!formData.nota_fiscal.trim())   return "Nota fiscal é obrigatória.";
    if (qtd === 0)                      return "Informe a quantidade de pallets.";
    if (descricoes.some((d) => !d.trim())) return "Todas as descrições de pallets devem ser preenchidas.";
    return null;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const erro = validate();
    if (erro) {
      toast({ title: "Dados inválidos", description: erro, variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const created = await createAgendamento({
        plate: formData.plate,
        driver: formData.driver,
        type: formData.type,
        zone: formData.zone,
        date: formData.date,
        time: formData.time,
        pallets: parseInt(formData.pallets),
        nota_fiscal: formData.nota_fiscal.trim(),
        descricoes_pallets: descricoes.map((descricao, i) => ({
          ordem: i + 1,
          descricao: descricao.trim(),
        })),
        tipo_unidade: "pallet",
        descricoes_volumes: []
      });
      toast({
        title: "Agendamento criado!",
        description: `Veículo ${created.plate} agendado para ${created.date} às ${created.time}`,
      });
      setOpen(false);
      resetForm();
      onCreated?.();
    } catch (err: any) {
      toast({ title: "Erro ao criar agendamento", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ plate: "", driver: "", type: "", zone: "", date: "", time: "", pallets: "", nota_fiscal: "" });
    setPatioSelecionado("");
    setZonas([]);
    setDescricoes([]);
  };

  const qtdPallets    = parseInt(formData.pallets) || 0;
  const patioAtual    = patios.find((p) => p.id.toString() === patioSelecionado);
  const zonaAtual     = zonas.find((z) => z.nome === formData.zone);

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Novo Agendamento
          </DialogTitle>
          <DialogDescription>
            Agende a entrada ou saída de um veículo no pátio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">

          {/* Placa + Motorista */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plate" className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />Placa
              </Label>
              <Input
                id="plate"
                placeholder="ABC-1234"
                value={formData.plate}
                onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                className="font-mono"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driver">Motorista</Label>
              <Input
                id="driver"
                placeholder="Nome do motorista"
                value={formData.driver}
                onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Tipo de Operação */}
          <div className="space-y-2">
            <Label>Tipo de Operação</Label>
            <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })} required>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">↓ Entrada</SelectItem>
                <SelectItem value="saida">↑ Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pátio + Zona — seleção em cascata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Pátio <span className="text-destructive">*</span>
              </Label>
              <Select
                value={patioSelecionado}
                onValueChange={setPatioSelecionado}
                disabled={loadingPatios}
              >
                <SelectTrigger>
                  {loadingPatios
                    ? <span className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" />Carregando...</span>
                    : <SelectValue placeholder="Selecione o pátio" />
                  }
                </SelectTrigger>
                <SelectContent>
                  {patios.length === 0
                    ? <div className="px-3 py-4 text-center text-sm text-muted-foreground">Nenhum pátio cadastrado</div>
                    : patios.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.nome}
                        </SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Zona <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.zone}
                onValueChange={(v) => setFormData({ ...formData, zone: v })}
                disabled={!patioSelecionado || loadingZonas}
              >
                <SelectTrigger>
                  {loadingZonas
                    ? <span className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" />Carregando...</span>
                    : <SelectValue placeholder={!patioSelecionado ? "Selecione o pátio primeiro" : "Selecione a zona"} />
                  }
                </SelectTrigger>
                <SelectContent>
                  {zonas.length === 0 && patioSelecionado
                    ? <div className="px-3 py-4 text-center text-sm text-muted-foreground">Nenhuma zona neste pátio</div>
                    : zonas.map((z) => (
                        <SelectItem key={z.id} value={z.nome}>
                          <span className="flex items-center gap-2">
                            <span>{z.nome}</span>
                            <span className="text-xs text-muted-foreground">
                              — {TIPO_ZONA_LABELS[z.tipo]} · {z.capacidade} pallets
                            </span>
                          </span>
                        </SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview da zona selecionada */}
          {zonaAtual && (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <span className="font-medium">{zonaAtual.nome}</span>
                <span className="text-muted-foreground"> · {TIPO_ZONA_LABELS[zonaAtual.tipo]}</span>
                {zonaAtual.localizacao && (
                  <span className="text-muted-foreground"> · {zonaAtual.localizacao}</span>
                )}
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {zonaAtual.capacidade} pallets
              </span>
            </div>
          )}

          {/* Data + Hora + Pallets */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Horário</Label>
              <Input id="time" type="time" value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pallets" className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />Pallets
              </Label>
              <Input
                id="pallets"
                type="number"
                min="1"
                placeholder="0"
                value={formData.pallets}
                onChange={(e) => setFormData({ ...formData, pallets: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Nota Fiscal */}
          <div className="space-y-2">
            <Label htmlFor="nota_fiscal" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Nota Fiscal <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nota_fiscal"
              placeholder="Ex: NF-000123"
              value={formData.nota_fiscal}
              onChange={(e) => setFormData({ ...formData, nota_fiscal: e.target.value })}
              required
            />
          </div>

          {/* Descrições dos Pallets */}
          {qtdPallets > 0 && (
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                Descrição dos Pallets
                <span className="text-xs text-muted-foreground">
                  ({descricoes.filter((d) => d.trim()).length}/{qtdPallets} preenchidos)
                </span>
              </Label>
              <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                {descricoes.map((desc, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <Input
                      placeholder={`Descrição do pallet ${i + 1}`}
                      value={desc}
                      onChange={(e) => setDescricao(i, e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
              {descricoes.some((d) => !d.trim()) && (
                <p className="text-xs text-destructive">Todas as descrições são obrigatórias.</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Agendamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
