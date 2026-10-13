import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../api/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: { email: string; password: string; name: string; phone?: string; address?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('accessToken');
  });

  useEffect(() => {
    if (token && !user) {
      authApi.getProfile()
        .then((fetchedUser) => {
          setUser(fetchedUser);
          localStorage.setItem('currentUser', JSON.stringify(fetchedUser));
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    const result = await authApi.login(email, pass);
    setToken(result.accessToken);
    setUser(result.user);
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('currentUser', JSON.stringify(result.user));
  };

  const register = async (payload: { email: string; password: string; name: string; phone?: string; address?: string }) => {
    await authApi.register(payload);
    await login(payload.email, payload.password);
  };

  const logout = () => {
    if (token) {
      authApi.logout().catch(() => {});
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
