import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '../services/authService';
import { getToken } from '../services/api';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const me = await authService.getMe();
      if (me) {
        setUser({ id: me.id, email: me.email, created_at: me.created_at });
      }
    } catch {
      // Token invalid or expired
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    const result = await authService.signIn(email, password);
    setUser({
      id: result.user.id,
      email: result.user.email,
      created_at: result.user.created_at,
    });
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    const result = await authService.signUp(email, password);
    setUser({
      id: result.user.id,
      email: result.user.email,
      created_at: result.user.created_at,
    });
  };

  const signOut = async (): Promise<void> => {
    await authService.signOut();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
