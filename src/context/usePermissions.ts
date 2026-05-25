import { useAuth } from "@/context/AuthContext";

type TipoUsuario = "administrador" | "portaria" | "recebimento" | "fornecedor";

interface Permissions {
  // Agendamentos
  podeVerAgendamentos:           boolean;
  podeCriarAgendamento:          boolean;
  podeAlterarStatusAgendamento:  boolean;
  podeEditarAgendamento:         boolean;
  podeCancelarAgendamento:       boolean;

  // Pallets
  podeVerPallets:                boolean;
  podeAlterarStatusPallet:       boolean;

  // Usuários e Pátios
  podeGerenciarUsuarios:         boolean;
  podeGerenciarPatios:           boolean;

  tipo:    TipoUsuario | null;
  isAdmin: boolean;
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
    // Fornecedor agora pode cancelar (os próprios — validado no back)
    podeCancelarAgendamento:       is("administrador", "fornecedor"),

    // Pallets
    // Fornecedor agora pode ver pallets (dos próprios agendamentos — filtrado no back)
    podeVerPallets:                is("administrador", "portaria", "recebimento", "fornecedor"),
    podeAlterarStatusPallet:       is("administrador", "recebimento"),

    // Admin only
    podeGerenciarUsuarios:         is("administrador"),
    podeGerenciarPatios:           is("administrador"),

    tipo,
    isAdmin: is("administrador"),
  };
}
