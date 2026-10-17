import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IUser, UserRole } from '../types/index.ts';
import { api, getStoredToken, setStoredToken, removeStoredToken } from '../services/api.ts';
import { joinUserRoom, joinRoleRoom } from '../services/socket.ts';

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isTechnician: boolean;
  isCustomer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize from token or default to Admin demo for instant showcase
  useEffect(() => {
    async function initAuth() {
      const token = getStoredToken();
      if (token) {
        try {
          const res = await api.getMe();
          if (res.user) {
            setUser(res.user);
            joinUserRoom(res.user._id);
            joinRoleRoom(res.user.role);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Stored token invalid, falling back to demo login:', e);
          removeStoredToken();
        }
      }

      // Default to Admin demo login on first load for optimal portfolio preview
      try {
        const res = await api.demoLogin('ADMIN');
        if (res.user && res.token) {
          setStoredToken(res.token);
          setUser(res.user);
          joinUserRoom(res.user._id);
          joinRoleRoom(res.user.role);
        }
      } catch (err) {
        console.error('Demo login failed:', err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      setStoredToken(res.token);
      setUser(res.user);
      joinUserRoom(res.user._id);
      joinRoleRoom(res.user.role);
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role: UserRole) => {
    setLoading(true);
    try {
      const res = await api.demoLogin(role);
      setStoredToken(res.token);
      setUser(res.user);
      joinUserRoom(res.user._id);
      joinRoleRoom(res.user.role);
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: any) => {
    setLoading(true);
    try {
      const res = await api.register(payload);
      setStoredToken(res.token);
      setUser(res.user);
      joinUserRoom(res.user._id);
      joinRoleRoom(res.user.role);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeStoredToken();
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isTechnician = user?.role === 'TECHNICIAN';
  const isCustomer = user?.role === 'CUSTOMER';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        demoLogin,
        register,
        logout,
        isAdmin,
        isTechnician,
        isCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
