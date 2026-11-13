import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { authService } from "../services/authService";
import type {
  AuthContextValue,
  LoginCredentials,
  User
} from "../types/auth.types";

const STORAGE_KEY = "supportly-auth-user";

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem(STORAGE_KEY);

      if (storedUser) {
        setUser(JSON.parse(storedUser) as User);
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<User> => {
      const authenticatedUser = await authService.login(credentials);

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);

      return authenticatedUser;
    },
    []
  );

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      if (sessionStorage.getItem(STORAGE_KEY)) {
        logout();
      }
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [logout]);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}