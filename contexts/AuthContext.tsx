"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const token = Cookies.get('token'); // Retrieves the cookie value for 'token'


  const checkAuth = async (): Promise<boolean> => {
    try {
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
        setUser(null);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      setUser(null);
      setIsLoading(false);
      return false;
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include", // important for receiving cookies
      });

      if (res.ok) {
        await checkAuth();
      } else {
        console.error("login: Login failed");
      }
    } catch (error) {
      console.error("login: Login error:", error);
    }
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:5000/auth/logout", {
        method: "POST",
        credentials: "include", // ensures cookie is sent with request
      });
    } catch (error) {
      console.error("logout: error during logout", error);
    }
    setUser(null);
    router.push("/auth/login");
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
