
import React, { createContext, useState, useContext, useEffect } from 'react';
import type { User } from '../types';
import socket from '../src/socket';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<User | null>;
  logout: () => Promise<void>;
  register: (email: string, pass: string) => Promise<User | null>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'app_session_permissive';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      try {
        const parsedUser = JSON.parse(session);
        // Rely on role for access, assuming server validated the email/pass
        setUser(parsedUser);
        if (parsedUser && parsedUser.role === 'client') {
          checkPayments(parsedUser.id);
        }
      } catch (e) {
        localStorage.removeItem(SESSION_KEY);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const checkPayments = async (userId: string) => {
    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const orders = await response.json();
        
        for (const order of orders) {
          if (order.user_id === userId && order.status === 'Pendente') {
            // Simula uma checagem automática: 80% de chance de dar certo
            const success = Math.random() > 0.2;
            if (success) {
              await fetch(`/api/orders/${order.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...order, status: 'Pago' })
              });
            }
          }
        }
      }
    } catch (e) {
      console.error("Erro ao checar pagamentos:", e);
    }
  };

  useEffect(() => {
    socket.on("orders_updated", () => {
      if (user && user.role === 'client') {
        // Opcional: recarregar algo se necessário, mas aqui a checagem é reativa
      }
    });
    return () => {
      socket.off("orders_updated");
    };
  }, [user]);

  const login = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Falha no login");
      }

      const sessionUser = await response.json();
      
      setUser(sessionUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      
      if (sessionUser.role === 'client') {
        checkPayments(sessionUser.id);
      }

      return sessionUser;
    } catch (e: any) {
      setError(e.message || "Erro ao entrar");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Falha no cadastro");
      }

      const sessionUser = await response.json();
      
      setUser(sessionUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      
      return sessionUser;
    } catch (e: any) {
      setError(e.message || "Erro ao cadastrar");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
