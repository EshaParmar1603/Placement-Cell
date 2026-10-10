import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authApi } from '../api/auth';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('placewise_access_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('placewise_access_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            setToken(storedToken);
          } else {
            clearSession();
          }
        } catch {
          clearSession();
        }
      }
      setIsLoading(false);
    }

    initAuth();
  }, []);

  const clearSession = () => {
    localStorage.removeItem('placewise_access_token');
    localStorage.removeItem('placewise_refresh_token');
    setUser(null);
    setToken(null);
  };

  const login = async (credentials: { email: string; password: string }) => {
    const res = await authApi.login(credentials);
    if (res.success && res.data) {
      const { user: loggedInUser, tokens } = res.data;
      localStorage.setItem('placewise_access_token', tokens.accessToken);
      localStorage.setItem('placewise_refresh_token', tokens.refreshToken);
      setUser(loggedInUser);
      setToken(tokens.accessToken);
    }
  };

  const register = async (data: any) => {
    const res = await authApi.register(data);
    if (res.success && res.data) {
      const { user: registeredUser, tokens } = res.data;
      localStorage.setItem('placewise_access_token', tokens.accessToken);
      localStorage.setItem('placewise_refresh_token', tokens.refreshToken);
      setUser(registeredUser);
      setToken(tokens.accessToken);
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('placewise_refresh_token');
    try {
      await authApi.logout(refreshToken || undefined);
    } catch {
      // Ignore network errors during logout
    } finally {
      clearSession();
    }
  };

  const refreshMe = async () => {
    try {
      const res = await authApi.getMe();
      if (res.success && res.data) {
        setUser(res.data);
      }
    } catch {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
