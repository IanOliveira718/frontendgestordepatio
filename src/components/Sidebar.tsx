import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Package,
  Map,
  Truck,
  BarChart3,
  Settings,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  badge?: number;
}

function NavItem({ icon: Icon, label, to, badge }: NavItemProps) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        active
          ? "bg-primary text-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span
          className={cn(
            "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold",
            active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-warning text-warning-foreground"
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-sidebar-border bg-sidebar lg:block">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-sidebar-foreground">Protótipo</h2>
            <p className="text-xs text-sidebar-foreground/60">v2.0</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <NavItem icon={LayoutDashboard} label="Dashboard" to="/" />
          <NavItem icon={Calendar} label="Agendamentos" to="/schedules" badge={5} />
          <NavItem icon={Map} label="Mapa do Pátio" to="/map" />
          <NavItem icon={Package} label="Estoque" to="/inventory" />
          <NavItem icon={Truck} label="Veículos" to="/vehicles" />
          <NavItem icon={BarChart3} label="Relatórios" to="/reports" />
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <NavItem icon={Settings} label="Configurações" to="/settings" />
          <NavItem icon={HelpCircle} label="Ajuda" to="/help" />
        </div>
      </div>
    </aside>
  );
}
