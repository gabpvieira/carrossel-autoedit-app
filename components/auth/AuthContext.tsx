import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../../services/authService';

interface Session {
  token: string;
  email: string;
  name: string;
}

interface AuthContextType {
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  session: null,
  login: async () => false,
  logout: () => {},
  isLoading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const activeSession = authService.getSession();
    if (activeSession) {
      setSession(activeSession);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const result = await authService.login(email, password);
    if (result) {
      setSession(result);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setSession(null);
    window.location.hash = ''; // Redirect to login
  }, []);

  const contextValue = {
    session,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
