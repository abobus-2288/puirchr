'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { authApi } from '@/lib/api';
import { getAuthToken, getUser, setUser, removeUser, isAdmin, setAuthToken, removeAuthToken } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;
  const userIsAdmin = isAdmin(user);

  const refreshUser = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setUserState(null);
        return;
      }

      const response = await authApi.me();
      setUserState(response.data);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUserState(null);
      removeUser();
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    setAuthToken(response.data.token);
    setUserState(response.data.user);
    setUser(response.data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await authApi.register({ name, email, password });
    setAuthToken(response.data.token);
    setUserState(response.data.user);
    setUser(response.data.user);
  };

  const logout = () => {
    setUserState(null);
    removeUser();
    removeAuthToken();
    window.location.href = '/login';
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      const savedUser = getUser();

      if (token && savedUser) {
        setUserState(savedUser);
        try {
          await refreshUser();
        } catch (error) {
          console.error('Failed to refresh user on init:', error);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin: userIsAdmin,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
