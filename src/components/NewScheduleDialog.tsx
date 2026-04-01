import { useState, useEffect } from "react";
import { Calendar, Truck, Package, MapPin, FileText, Box } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { createAgendamento, TipoUnidade, VolumeDescricao } from "@/services/agendamentosService";

interface NewScheduleDialogProps {
  children:   React.ReactNode;
  onCreated?: () => void;
}

interface VolumeForm {
  descricao:   string;
  altura:      string;
  largura:     string;
  comprimento: string;
}

const emptyVolume = (): VolumeForm => ({ descricao: "", altura: "", largura: "", comprimento: "" });

export function NewScheduleDialog({ children, onCreated }: NewScheduleDialogProps) {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    plate: "", driver: "", type: "", zone: "",
    date: "", time: "", pallets: "", nota_fiscal: "",
  });

  const [tipoUnidade, setTipoUnidade] = useState<TipoUnidade>("pallet");

  // Arrays de descrições — um por tipo
  const [descricoesPallet,  setDescricoesPallet]  = useState<string[]>([]);
  const [descricoesVolume,  setDescricoesVolume]  = useState<VolumeForm[]>([]);

  // Sincroniza arrays com a quantidade de pallets/volumes
  useEffect(() => {
    const qtd = parseInt(formData.pallets) || 0;
    if (tipoUnidade === "pallet") {
      setDescricoesPallet((prev) =>
        qtd > prev.length
          ? [...prev, ...Array(qtd - prev.length).fill("")]
          : prev.slice(0, qtd)
      );
    } else {
      setDescricoesVolume((prev) =>
        qtd > prev.length
          ? [...prev, ...Array(qtd - prev.length).fill(null).map(emptyVolume)]
          : prev.slice(0, qtd)
      );
    }
  }, [formData.pallets, tipoUnidade]);

  // Ao trocar o tipo, limpa os arrays do tipo anterior
  const handleTipoUnidade = (val: TipoUnidade) => {
    setTipoUnidade(val);
    setDescricoesPallet([]);
    setDescricoesVolume([]);
  };

  const setPalletDesc = (i: number, val: string) =>
    setDescricoesPallet((prev) => prev.map((d, idx) => idx === i ? val : d));

  const setVolumeField = (i: number, field: keyof VolumeForm, val: string) =>
    setDescricoesVolume((prev) =>
      prev.map((v, idx) => idx === i ? { ...v, [field]: val } : v)
    );

  // ── Validação ──────────────────────────────────────────────────────────────
  const validate = (): string | null => {
    const qtd = parseInt(formData.pallets) || 0;
    if (!formData.nota_fiscal.trim()) return "Nota fiscal é obrigatória.";
    if (qtd === 0)                    return "Informe a quantidade de unidades.";

    if (tipoUnidade === "pallet") {
      if (descricoesPallet.some((d) => !d.trim()))
        return "Todas as descrições de pallets devem ser preenchidas.";
    } else {
      for (let i = 0; i < descricoesVolume.length; i++) {
        const v = descricoesVolume[i];
        if (!v.descricao.trim())   return `Volume ${i + 1}: preencha a descrição.`;
        if (!v.altura.trim())      return `Volume ${i + 1}: preencha a altura.`;
        if (!v.largura.trim())     return `Volume ${i + 1}: preencha a largura.`;
        if (!v.comprimento.trim()) return `Volume ${i + 1}: preencha o comprimento.`;
      }
    }
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
        plate:       formData.plate,
        driver:      formData.driver,
        type:        formData.type,
        zone:        formData.zone,
        date:        formData.date,
        time:        formData.time,
        pallets:     parseInt(formData.pallets),
        nota_fiscal: formData.nota_fiscal.trim(),
        tipo_unidade: tipoUnidade,
        descricoes_pallets: tipoUnidade === "pallet"
          ? descricoesPallet.map((descricao, i) => ({ ordem: i + 1, descricao: descricao.trim() }))
          : [],
        descricoes_volumes: tipoUnidade === "volume"
          ? descricoesVolume.map((v, i) => ({
              ordem:       i + 1,
              descricao:   v.descricao.trim(),
              altura:      parseFloat(v.altura),
              largura:     parseFloat(v.largura),
              comprimento: parseFloat(v.comprimento),
            }))
          : [],
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
    setTipoUnidade("pallet");
    setDescricoesPallet([]);
    setDescricoesVolume([]);
  };

  const qtd = parseInt(formData.pallets) || 0;

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Novo Agendamento
          </DialogTitle>
          <DialogDescription>Agende a entrada ou saída de um veículo no pátio.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">

          {/* Placa + Motorista */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plate" className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />Placa
              </Label>
              <Input id="plate" placeholder="ABC-1234" className="font-mono"
                value={formData.plate}
                onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driver">Motorista</Label>
              <Input id="driver" placeholder="Nome do motorista"
                value={formData.driver}
                onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                required />
            </div>
          </div>

          {/* Tipo + Zona */}
          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />Zona</Label>
              <Select value={formData.zone} onValueChange={(v) => setFormData({ ...formData, zone: v })} required>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A1">Zona A1</SelectItem>
                  <SelectItem value="A2">Zona A2</SelectItem>
                  <SelectItem value="B1">Zona B1</SelectItem>
                  <SelectItem value="B2">Zona B2</SelectItem>
                  <SelectItem value="C1">Zona C1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data + Hora + Quantidade */}
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
                <Package className="h-4 w-4 text-muted-foreground" />Quantidade
              </Label>
              <Input id="pallets" type="number" min="1" placeholder="0"
                value={formData.pallets}
                onChange={(e) => setFormData({ ...formData, pallets: e.target.value })} required />
            </div>
          </div>

          {/* Nota Fiscal */}
          <div className="space-y-2">
            <Label htmlFor="nota_fiscal" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Nota Fiscal <span className="text-destructive">*</span>
            </Label>
            <Input id="nota_fiscal" placeholder="Ex: NF-000123"
              value={formData.nota_fiscal}
              onChange={(e) => setFormData({ ...formData, nota_fiscal: e.target.value })} required />
          </div>

          {/* Tipo de Unidade — toggle */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Box className="h-4 w-4 text-muted-foreground" />
              Tipo de Unidade
            </Label>
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(["pallet", "volume"] as TipoUnidade[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTipoUnidade(t)}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    tipoUnidade === t
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {t === "pallet" ? "📦 Pallet" : "📐 Volume"}
                </button>
              ))}
            </div>
          </div>

          {/* Descrições — renderiza conforme tipo */}
          {qtd > 0 && (
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                {tipoUnidade === "pallet" ? <Package className="h-4 w-4 text-muted-foreground" /> : <Box className="h-4 w-4 text-muted-foreground" />}
                {tipoUnidade === "pallet" ? "Descrição dos Pallets" : "Descrição dos Volumes"}
                <span className="text-xs text-muted-foreground">
                  ({tipoUnidade === "pallet"
                    ? descricoesPallet.filter((d) => d.trim()).length
                    : descricoesVolume.filter((v) => v.descricao.trim()).length
                  }/{qtd} preenchidos)
                </span>
              </Label>

              <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
                {tipoUnidade === "pallet"
                  ? descricoesPallet.map((desc, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {i + 1}
                        </span>
                        <Input
                          placeholder={`Descrição do pallet ${i + 1}`}
                          value={desc}
                          onChange={(e) => setPalletDesc(i, e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    ))
                  : descricoesVolume.map((vol, i) => (
                      <div key={i} className="space-y-2 rounded-md border border-border/50 bg-background p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {i + 1}
                          </span>
                          <Input
                            placeholder={`Descrição do volume ${i + 1}`}
                            value={vol.descricao}
                            onChange={(e) => setVolumeField(i, "descricao", e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2 pl-8">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Altura (cm)</Label>
                            <Input
                              type="number" min="0" step="0.01" placeholder="0.00"
                              value={vol.altura}
                              onChange={(e) => setVolumeField(i, "altura", e.target.value)}
                              className="h-7 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Largura (cm)</Label>
                            <Input
                              type="number" min="0" step="0.01" placeholder="0.00"
                              value={vol.largura}
                              onChange={(e) => setVolumeField(i, "largura", e.target.value)}
                              className="h-7 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Comprimento (cm)</Label>
                            <Input
                              type="number" min="0" step="0.01" placeholder="0.00"
                              value={vol.comprimento}
                              onChange={(e) => setVolumeField(i, "comprimento", e.target.value)}
                              className="h-7 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                }
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Agendamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
