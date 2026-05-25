import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Clock, Save, Info, RefreshCw } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Header }  from "@/components/Header";
import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import { Label }   from "@/components/ui/label";
import { toast }   from "@/hooks/use-toast";
import { cn }      from "@/lib/utils";
import { usePermissions }    from "@/context/usePermissions";
import { fetchConfiguracao, updateConfiguracao, ConfiguracaoAPI } from "@/services/configService";

export default function Settings() {
  const permissions = usePermissions();

  const [config,   setConfig]   = useState<ConfiguracaoAPI | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [dias,     setDias]     = useState("0");
  const [horas,    setHoras]    = useState("24");

  useEffect(() => {
    setLoading(true);
    fetchConfiguracao()
      .then((c) => {
        setConfig(c);
        setDias(String(c.janela_dias));
        setHoras(String(c.janela_horas));
      })
      .catch(() => toast({ title: "Erro ao carregar configurações.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    const d = parseInt(dias)  || 0;
    const h = parseInt(horas) || 0;

    if (d === 0 && h === 0) {
      toast({ title: "A janela de tempo não pode ser zero.", variant: "destructive" });
      return;
    }
    if (h > 23) {
      toast({ title: "Horas deve ser entre 0 e 23.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const updated = await updateConfiguracao({ janela_dias: d, janela_horas: h });
      setConfig(updated);
      toast({ title: "Configurações salvas!", description: `Janela: ${updated.janela_dias}d ${updated.janela_horas}h (${updated.janela_total_horas}h total)` });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const totalHoras = (parseInt(dias) || 0) * 24 + (parseInt(horas) || 0);
  const hasChanges = config
    ? parseInt(dias) !== config.janela_dias || parseInt(horas) !== config.janela_horas
    : false;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Header />
        <main className="p-6 space-y-6 max-w-2xl">

          {/* Cabeçalho */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
            <p className="text-sm text-muted-foreground mt-1">Parâmetros do sistema</p>
          </div>

          {/* Card de configuração de janela */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Header do card */}
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Janela de Capacidade</p>
                <p className="text-xs text-muted-foreground">
                  Período considerado para verificar a capacidade das zonas no agendamento
                </p>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Carregando...
                </div>
              ) : (
                <>
                  {/* Explicação da regra */}
                  <div className="flex gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 text-sm">
                    <Info className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
                    <div className="text-muted-foreground space-y-1">
                      <p>Ao criar um agendamento para a zona <strong className="text-foreground">X</strong> no horário <strong className="text-foreground">H</strong>, o sistema soma:</p>
                      <ul className="list-disc list-inside space-y-0.5 ml-1">
                        <li>Pallets de agendamentos ativos em <strong className="text-foreground">[H − janela, H + janela]</strong></li>
                        <li>Pallets de agendamentos concluídos em <strong className="text-foreground">[H − janela, H]</strong></li>
                        <li>Pallets da solicitação corrente</li>
                      </ul>
                      <p className="pt-1">O total deve ser <strong className="text-foreground">≤ capacidade da zona</strong>. Agendamentos cancelados são ignorados.</p>
                    </div>
                  </div>

                  {/* Campos de configuração */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="janela_dias" className="flex items-center gap-2">
                        Dias
                      </Label>
                      <Input
                        id="janela_dias"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={dias}
                        onChange={(e) => setDias(e.target.value)}
                        disabled={!permissions.isAdmin}
                      />
                      <p className="text-xs text-muted-foreground">Dias antes e depois</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="janela_horas" className="flex items-center gap-2">
                        Horas
                      </Label>
                      <Input
                        id="janela_horas"
                        type="number"
                        min="0"
                        max="23"
                        placeholder="24"
                        value={horas}
                        onChange={(e) => setHoras(e.target.value)}
                        disabled={!permissions.isAdmin}
                      />
                      <p className="text-xs text-muted-foreground">0 a 23 horas adicionais</p>
                    </div>
                  </div>

                  {/* Preview da janela total */}
                  <div className={cn(
                    "flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors",
                    hasChanges
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-muted/30"
                  )}>
                    <span className="text-muted-foreground">Janela total resultante</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-lg">{totalHoras}h</span>
                      {hasChanges && (
                        <span className="text-xs text-muted-foreground">
                          (atual: {config?.janela_total_horas}h)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Exemplos de janela */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "12 horas",  dias: 0, horas: 12 },
                      { label: "24 horas",  dias: 0, horas: 24 },
                      { label: "2 dias",    dias: 2, horas: 0  },
                    ].map((p) => (
                      <button
                        key={p.label}
                        disabled={!permissions.isAdmin}
                        onClick={() => { setDias(String(p.dias)); setHoras(String(p.horas)); }}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                          parseInt(dias) === p.dias && parseInt(horas) === p.horas
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                          !permissions.isAdmin && "cursor-not-allowed opacity-50"
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Botão salvar — só admin */}
                  {permissions.isAdmin && (
                    <div className="flex justify-end pt-1">
                      <Button
                        onClick={handleSave}
                        disabled={saving || !hasChanges}
                        className="gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {saving ? "Salvando..." : "Salvar Configurações"}
                      </Button>
                    </div>
                  )}

                  {!permissions.isAdmin && (
                    <p className="text-xs text-muted-foreground text-center pt-1">
                      Apenas administradores podem alterar as configurações.
                    </p>
                  )}

                  {/* Última atualização */}
                  {config?.updated_at && (
                    <p className="text-xs text-muted-foreground text-right">
                      Última alteração:{" "}
                      {new Date(config.updated_at).toLocaleString("pt-BR", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
