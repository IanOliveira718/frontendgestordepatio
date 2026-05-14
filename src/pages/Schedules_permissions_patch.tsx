// ── Adicione no topo do Schedules.tsx ────────────────────────────────────────
import { usePermissions } from "@/context/usePermissions";

// ── Dentro do componente Schedules(), logo no início: ─────────────────────────
const permissions = usePermissions();

// ── Botão "Novo Agendamento" — só aparece para admin e fornecedor: ────────────
{permissions.podeCriarAgendamento && (
  <Button onClick={handleNewSchedule} className="gap-2">
    <Plus className="h-4 w-4" />
    Novo Agendamento
  </Button>
)}

// ── No card de agendamento, o DropdownMenu de ações: ─────────────────────────
// Substitua o DropdownMenuContent por este:
<DropdownMenuContent align="end">
  {/* Editar dados — só admin */}
  {permissions.podeEditarAgendamento && (
    <DropdownMenuItem onClick={() => handleEdit(schedule)}>
      <Pencil className="mr-2 h-4 w-4" />Editar
    </DropdownMenuItem>
  )}

  {/* Alterar status — admin, portaria, recebimento */}
  {permissions.podeAlterarStatusAgendamento && (
    <DropdownMenuItem onClick={() => handleAlterarStatus(schedule)}>
      <Clock className="mr-2 h-4 w-4" />Alterar Status
    </DropdownMenuItem>
  )}

  {/* Cancelar — só admin */}
  {permissions.podeCancelarAgendamento && (
    <DropdownMenuItem onClick={() => handleDelete(schedule)}
      className="text-destructive focus:text-destructive">
      <Trash2 className="mr-2 h-4 w-4" />Cancelar
    </DropdownMenuItem>
  )}
</DropdownMenuContent>

// ── No Dialog de edição, separe em dois dialogs: ─────────────────────────────
// 1. Dialog de EDIÇÃO DE DADOS (placa, motorista, zona, etc.) → só para admin
// 2. Dialog de ALTERAÇÃO DE STATUS → para admin, portaria e recebimento
// Ambos já existem no Schedules.tsx, só condicione qual abre em handleEdit
// e crie um handleAlterarStatus separado para o dialog de status apenas.
