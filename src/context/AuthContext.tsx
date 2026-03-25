import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, getMe, logout as authLogout, TokenStorage } from "@/services/authService";

interface AuthContextType {
  user:       User | null;
  loading:    boolean;
  isAuth:     boolean;
  setUser:    (u: User | null) => void;
  logout:     () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Ao montar, verifica se existe token válido e carrega o usuário
  useEffect(() => {
    const token = TokenStorage.getAccess();
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => TokenStorage.clear())
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    authLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuth: !!user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
