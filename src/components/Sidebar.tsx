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
} from "lucide-react";

import { cn } from "@/lib/utils";
import logoDfl from "@/assets/logo-dfl-vazada.png";

import { useState } from "react";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  collapsed: boolean;
  onClick?: () => void;
}

function NavItem({
  icon: Icon,
  label,
  to,
  collapsed,
  onClick,
}: NavItemProps) {
  const location = useLocation();

  const active = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        collapsed ? "justify-center" : "gap-3",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />

      {!collapsed && (
        <span className="flex-1 text-left">
          {label}
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* BOTÃO MOBILE */}
      <button
        onClick={() => setMobileOpen(true)}
        className="
          fixed left-4 top-4 z-50 rounded-lg border
          border-sidebar-border bg-sidebar p-2
          text-sidebar-foreground shadow-lg
          lg:hidden
        "
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* BACKDROP MOBILE */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300",

          // DESKTOP
          "hidden lg:block",
          collapsed ? "lg:w-20" : "lg:w-64",

          // MOBILE
          mobileOpen
            ? "block w-screen"
            : "hidden"
        )}
      >
        <div className="flex h-full flex-col">

          {/* HEADER */}
          <div className="flex h-20 items-center border-b border-sidebar-border px-4">

            {/* DESKTOP TOGGLE */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden rounded-lg p-2 transition-colors hover:bg-sidebar-accent lg:block"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* MOBILE CLOSE */}
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-2 transition-colors hover:bg-sidebar-accent lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>

            {!collapsed && (
              <div className="flex flex-1 justify-center">
                <img
                  src={logoDfl}
                  alt="DFL Logo"
                  className="h-14 w-auto object-contain"
                />
              </div>
            )}
          </div>

          {/* NAV */}
          <nav className="flex-1 space-y-1 p-4">

            <NavItem
              icon={LayoutDashboard}
              label="Dashboard"
              to="/"
              collapsed={!mobileOpen && collapsed}
              onClick={() => setMobileOpen(false)}
            />

            <NavItem
              icon={DoorOpen}
              label="Portaria"
              to="/gate"
              collapsed={!mobileOpen && collapsed}
              onClick={() => setMobileOpen(false)}
            />

            <NavItem
              icon={Calendar}
              label="Agendamentos"
              to="/schedules"
              collapsed={!mobileOpen && collapsed}
              onClick={() => setMobileOpen(false)}
            />

            <NavItem
              icon={Truck}
              label="Patios"
              to="/patios"
              collapsed={!mobileOpen && collapsed}
              onClick={() => setMobileOpen(false)}
            />

            <NavItem
              icon={BarChart3}
              label="Zonas"
              to="/zones"
              collapsed={!mobileOpen && collapsed}
              onClick={() => setMobileOpen(false)}
            />

            <NavItem
              icon={Package}
              label="Pallets"
              to="/pallets"
              collapsed={!mobileOpen && collapsed}
              onClick={() => setMobileOpen(false)}
            />
          </nav>

          {/* FOOTER */}
          <div className="border-t border-sidebar-border p-4">

            <NavItem
              icon={Settings}
              label="Configurações"
              to="/settings"
              collapsed={!mobileOpen && collapsed}
              onClick={() => setMobileOpen(false)}
            />

            <NavItem
              icon={HelpCircle}
              label="Ajuda"
              to="/help"
              collapsed={!mobileOpen && collapsed}
              onClick={() => setMobileOpen(false)}
            />
          </div>
        </div>
      </aside>
    </>
  );
}