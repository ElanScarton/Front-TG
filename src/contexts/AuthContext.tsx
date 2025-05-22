import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { setTokenProvider, setAuthErrorHandler } from '../data/api'; // Importa as funções de configuração
import { login, logout, isAuthenticated, getUserType, canAccess } from '../services/authService'; // Importa funções do serviço

// Definindo enum para tipos de usuário
export enum UserType {
  CONSUMIDOR = 1,
  FORNECEDOR = 2,
  ADMINISTRADOR = 3,
}

export interface User {
  id: string;
  name: string;
  email: string;
  userType: UserType;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
  getUserType: () => UserType | null;
  canAccess: (allowedTypes: UserType[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  // Configurar o provedor de token para o api.ts
  useEffect(() => {
    // Configura o provedor de token para usar nosso estado atual
    setTokenProvider(() => token);

    // Configura o handler de erro de autenticação
    setAuthErrorHandler(() => {
      logout();
      window.location.href = '/login';
    });
  }, [token]);

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  }, [token]);

  // Função de login que utiliza o authService
  const handleLogin = async (email: string, senha: string) => {
    const { token, user } = await login(email, senha);
    setToken(token);
    setUser(user);
  };

  // Funções que utilizam o authService
  const handleLogout = () => {
    logout();
    setUser(null);
    setToken(null);
  };

  const handleIsAuthenticated = () => {
    return isAuthenticated(token);
  };

  const handleGetUserType = () => {
    return getUserType(user);
  };

  const handleCanAccess = (allowedTypes: UserType[]) => {
    return canAccess(user, allowedTypes);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login: handleLogin,
        logout: handleLogout,
        isAuthenticated: handleIsAuthenticated,
        getUserType: handleGetUserType,
        canAccess: handleCanAccess,
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