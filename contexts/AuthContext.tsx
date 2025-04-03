"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const login = (token: string) => {
    sessionStorage.setItem("sggtx", token);
    checkAuth();
  };

  const logout = () => {
    sessionStorage.removeItem("sggtx");
    setUser(null);
    router.push("/auth/login");
  };

  const checkAuth = async (): Promise<boolean> => {
    try {
      const token = sessionStorage.getItem("sggtx");
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return false;
      }

      const res = await fetch("http://localhost:5000/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setIsLoading(false);
        return true;
      } else {
        sessionStorage.removeItem("sggtx");
        setUser(null);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setIsLoading(false);
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};