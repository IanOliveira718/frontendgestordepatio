// ── Adicione no topo do Pallets.tsx ──────────────────────────────────────────
import { usePermissions } from "@/context/usePermissions";

// ── Dentro de PalletDetailModal, passe a permissão como prop: ────────────────

// 1. Adicione a prop na interface:
interface PalletDetailModalProps {
  pallet:               PalletAPI | null;
  onClose:              () => void;
  onUpdated:            (updated: PalletAPI) => void;
  podeAlterarStatus:    boolean;  // ← nova prop
}

// 2. Na página principal, passe a permissão:
const permissions = usePermissions();

<PalletDetailModal
  pallet={palletDetalhe}
  onClose={() => setPalletDetalhe(null)}
  onUpdated={handlePalletUpdated}
  podeAlterarStatus={permissions.podeAlterarStatusPallet}  // ← adicionar
/>

// 3. Dentro do modal, envolva a seção de ações com a condição:
{podeAlterarStatus ? (
  <div className="space-y-2">
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      Ações disponíveis
    </p>
    <div className="grid grid-cols-2 gap-2">
      {ACOES.map((acao) => { /* ... botões existentes ... */ })}
    </div>
  </div>
) : (
  <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground text-center">
    Visualização apenas — sem permissão para alterar status
  </div>
)}
