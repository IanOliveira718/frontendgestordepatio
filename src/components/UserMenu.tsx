import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

import {
  User,
  LogOut,
  Mail,
  AtSign,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

interface UserMenuProps {
  children: React.ReactNode;
}

export function UserMenu({ children }: UserMenuProps) {
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80"
      >
        <DropdownMenuLabel>
          Minha Conta
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <div className="p-3 space-y-4">

          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>

            <div>
              <p className="font-medium leading-none">
                {user.first_name} {user.last_name}
              </p>

              <p className="text-sm text-muted-foreground mt-1">
                @{user.username}
              </p>
            </div>
          </div>

          <div className="space-y-3">

            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />

              <span className="break-all text-muted-foreground">
                {user.email}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <AtSign className="h-4 w-4 text-muted-foreground" />

              <span className="text-muted-foreground">
                {user.username}
              </span>
            </div>

          </div>

        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-500 focus:text-red-500 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair da Conta
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}