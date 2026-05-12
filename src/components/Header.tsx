import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoDfl from "@/assets/logo-dfl.jpg";
import { useAuth } from "@/context/AuthContext";
import { UserMenu } from "./UserMenu";

export function Header() {
  const UserLogged = useAuth();

  return (
    <header className="sticky top-0 z-0 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <img 
            src={logoDfl} 
            alt="DFL Logo" 
            className="h-10 w-auto object-contain lg:hidden"
          />
          <div className="hidden lg:block">
            <h1 className="text-lg font-bold font-display text-foreground">Gestão de Pátio</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <UserMenu>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </UserMenu>
        </div>
      </div>
    </header>
  );
}
