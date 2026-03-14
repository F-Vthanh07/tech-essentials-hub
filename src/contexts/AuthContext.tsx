import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { User } from "@/types/user";

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: string | null;
  isAuthReady: boolean;
  /**
   * Update the current authenticated user and optionally save a token.
   * Passing `null` for user will clear the authentication state.
   */
  setAuth: (user: User | null, token?: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        let normalized: any = null;
        if (parsed && typeof parsed === "object") {
          if (Array.isArray(parsed)) {
            normalized = parsed.find((p: any) => p && typeof p === 'object' && (p.email || p.name)) || parsed[0];
          } else {
            normalized = parsed;
          }
        }
        if (normalized) {
          setUser(normalized as User);
          setRole(normalized.role ?? null);
        }
      } catch (e) {
        console.warn("invalid user in storage", e);
      }
    }
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
    }
    setIsAuthReady(true);
  }, []);

  const setAuth = (userData: User | null, authToken: string | null = null) => {
    if (userData) {
      setUser(userData);
      setRole(userData.role ?? null);
      localStorage.setItem("currentUser", JSON.stringify(userData));
    } else {
      setUser(null);
      setRole(null);
      localStorage.removeItem("currentUser");
    }

    if (authToken) {
      setToken(authToken);
      localStorage.setItem("authToken", authToken);
    } else if (authToken === null) {
      setToken(null);
      localStorage.removeItem("authToken");
    }
  };

  const logout = () => {
    setAuth(null, null);
  };

  const authContextValue = useMemo(
    () => ({ user, token, role, isAuthReady, setAuth, logout }),
    [user, token, role, isAuthReady]
  );

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
