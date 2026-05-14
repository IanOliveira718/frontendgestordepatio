import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  Calendar,
  Truck,
  BarChart3,
  Settings,
  HelpCircle,
  DoorOpen,
  Package,
  Menu,
  X,
  Users,
  Layers,
  Building2,
  ChevronLeft,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import logoDfl from "@/assets/logo-dfl-vazada.png";

import { usePermissions } from "@/context/usePermissions";
import { useAuth } from "@/context/AuthContext";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItemType {
  label: string;
  to: string;
  icon: React.ElementType;
  show: boolean;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItemType[];
}

interface NavItemProps {
  item: NavItemType;
  collapsed: boolean;
  onClick?: () => void;
}

function NavItem({ item, collapsed, onClick }: NavItemProps) {
  const location = useLocation();

  const active =
    item.to === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(item.to);

  const content = (
    <Link
      to={item.to}
      onClick={onClick}
      className={cn(
        "group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        collapsed ? "justify-center" : "gap-3",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <item.icon className="h-5 w-5 shrink-0" />

      {!collapsed && (
        <>
          <span className="flex-1 truncate text-left">
            {item.label}
          </span>

          {item.badge && (
            <span
              className={cn(
                "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold",
                active
                  ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
                  : "bg-warning text-warning-foreground"
              )}
            >
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );

  if (!collapsed) {
    return content;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {content}
      </TooltipTrigger>

      <TooltipContent side="right">
        {item.label}
      </TooltipContent>
    </Tooltip>
  );
}

function UserFooter({ collapsed }: { collapsed: boolean }) {
  const { user, logout } = useAuth();

  return (
    <div className="border-t border-sidebar-border p-4">
      <div
        className={cn(
          "flex items-center rounded-xl bg-sidebar-accent/50 p-2",
          collapsed ? "justify-center" : "gap-3"
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
          {user?.first_name?.[0] || "U"}
        </div>

        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {user?.first_name} {user?.last_name}
              </p>

              <p className="truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>

            <button
              onClick={logout}
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-sidebar-accent"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function Sidebar() {
  const location = useLocation();
  const permissions = usePermissions();

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebar:collapsed") === "true";
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("sidebar:collapsed", String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
      }
    };

    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navGroups: NavGroup[] = useMemo(
    () => [
      {
        title: "GERAL",
        items: [
          {
            label: "Dashboard",
            to: "/",
            icon: LayoutDashboard,
            show: true,
          },
          {
            label: "Agendamentos",
            to: "/schedules",
            icon: Calendar,
            show: permissions.podeVerAgendamentos,
          },
          {
            label: "Pallets",
            to: "/pallets",
            icon: Package,
            show: permissions.podeVerPallets,
          },
        ],
      },
      {
        title: "OPERAÇÃO",
        items: [
          {
            label: "Portaria",
            to: "/gate",
            icon: DoorOpen,
            show:
              permissions.isAdmin || permissions.tipo === "portaria",
          },
          {
            label: "Pátios",
            to: "/patios",
            icon: Building2,
            show: permissions.podeGerenciarPatios,
          },
          {
            label: "Zonas",
            to: "/zones",
            icon: Layers,
            show: permissions.podeGerenciarPatios,
          },
          {
            label: "Movimentações",
            to: "/movements",
            icon: Truck,
            show: permissions.podeVerPallets,
          },
        ],
      },
      {
        title: "ADMIN",
        items: [
          {
            label: "Usuários",
            to: "/users",
            icon: Users,
            show: permissions.podeGerenciarUsuarios,
          },
          {
            label: "Relatórios",
            to: "/reports",
            icon: BarChart3,
            show: permissions.isAdmin,
          },
        ],
      },
    ],
    [permissions]
  );

  const sidebarContent = (mobile = false) => (
    <div className="flex h-full flex-col bg-sidebar">
      {/* HEADER */}
      <div
        className={cn(
          "flex h-20 items-center border-b border-sidebar-border px-4",
          collapsed && !mobile
            ? "justify-center"
            : "justify-between"
        )}
      >
        {(!collapsed || mobile) && (
          <img
            src={logoDfl}
            alt="DFL Logo"
            className="h-14 w-auto object-contain"
          />
        )}

        {/* DESKTOP BUTTON */}
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-sidebar-accent lg:flex"
          >
            {collapsed ? (
              <Menu className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        )}

        {/* MOBILE CLOSE */}
        {mobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-sidebar-accent"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* NAVIGATION */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <TooltipProvider delayDuration={0}>
          <div className="space-y-6">
            {navGroups.map((group) => {
              const visibleItems = group.items.filter((item) => item.show);

              if (!visibleItems.length) {
                return null;
              }

              return (
                <div key={group.title}>
                  {!collapsed && (
                    <p className="mb-2 px-3 text-xs font-semibold tracking-wider text-muted-foreground">
                      {group.title}
                    </p>
                  )}

                  <div className="space-y-1">
                    {visibleItems.map((item) => (
                      <NavItem
                        key={item.to}
                        item={item}
                        collapsed={collapsed && !mobile}
                        onClick={() => mobile && setMobileOpen(false)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TooltipProvider>
      </div>

      {/* FOOTER */}
      <div className="space-y-1 border-t border-sidebar-border p-3">
        <NavItem
          item={{
            label: "Configurações",
            to: "/settings",
            icon: Settings,
            show: true,
          }}
          collapsed={collapsed && !mobile}
        />

        <NavItem
          item={{
            label: "Ajuda",
            to: "/help",
            icon: HelpCircle,
            show: true,
          }}
          collapsed={collapsed && !mobile}
        />
      </div>

      <UserFooter collapsed={collapsed && !mobile} />
    </div>
  );

  return (
    <>
      {/* MOBILE BUTTON */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu"
        className={cn(
          "fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl",
          "border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-lg",
          "transition-all duration-200 hover:bg-sidebar-accent lg:hidden",
          mobileOpen && "pointer-events-none opacity-0"
        )}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* BACKDROP */}
      <div
        onClick={() => setMobileOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
      />

      {/* DESKTOP */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300 lg:block",
          collapsed ? "w-20" : "w-72"
        )}
      >
        {sidebarContent(false)}
      </aside>

      {/* MOBILE */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-72 border-r border-sidebar-border bg-sidebar shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent(true)}
      </aside>
    </>
  );
}