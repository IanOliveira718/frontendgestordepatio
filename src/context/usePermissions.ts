import { useAuth } from "@/context/AuthContext";

type TipoUsuario = "administrador" | "portaria" | "recebimento" | "fornecedor";

interface Permissions {
  // Agendamentos
  podeVerAgendamentos:        boolean;
  podeCriarAgendamento:       boolean;
  podeAlterarStatusAgendamento: boolean;
  podeEditarAgendamento:      boolean;  // editar dados (placa, motorista, etc.)
  podeCancelarAgendamento:    boolean;

  // Pallets
  podeVerPallets:             boolean;
  podeAlterarStatusPallet:    boolean;

  // Usuários
  podeGerenciarUsuarios:      boolean;

  // Pátios e Zonas
  podeGerenciarPatios:        boolean;

  // Tipo atual
  tipo:                       TipoUsuario | null;
  isAdmin:                    boolean;
}

export function usePermissions(): Permissions {
  const { user } = useAuth();
  const tipo = ((user as any)?.tipo ?? null) as TipoUsuario | null;

  const is = (...tipos: TipoUsuario[]) => tipo !== null && tipos.includes(tipo);

  return {
    // Agendamentos
    podeVerAgendamentos:           is("administrador", "portaria", "recebimento", "fornecedor"),
    podeCriarAgendamento:          is("administrador", "fornecedor"),
    podeAlterarStatusAgendamento:  is("administrador", "portaria", "recebimento"),
    podeEditarAgendamento:         is("administrador"),
    podeCancelarAgendamento:       is("administrador"),

    // Pallets
    podeVerPallets:                is("administrador", "portaria", "recebimento"),
    podeAlterarStatusPallet:       is("administrador", "recebimento"),

    // Usuários e Pátios — só admin
    podeGerenciarUsuarios:         is("administrador"),
    podeGerenciarPatios:           is("administrador"),

    // Utilitários
    tipo,
    isAdmin:                       is("administrador"),
  };
}
