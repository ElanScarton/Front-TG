import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api, { setTokenProvider, setAuthErrorHandler } from '../services/api'; // Importa as funções de configuração

// Definindo enum para tipos de usuário
export enum UserType {
  Consumidor = 1,
  Fornecedor = 2,
  Administrador = 3
}

interface User {
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
  }, []);

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  }, [token]);

  const login = async (email: string, senha: string) => {
    try {
      // Usando a instância do axios configurada no api.ts
      const response = await api.post('/auth', {
        email,
        senha
      });

      // O backend retorna apenas o token
      const token = response.data;
      
      if (!token) {
        throw new Error('Token não retornado pelo servidor');
      }

      // Armazenar token
      localStorage.setItem('token', token);
      setToken(token);
      
      // Extrair informações do usuário do token JWT (parte payload)
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        // Recuperar o tipo de usuário da role
        let userType = UserType.Consumidor; // Valor padrão
        const roleValue = payload[`http://schemas.microsoft.com/ws/2008/06/identity/claims/role`] || 
                          payload[`http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role`] || 
                          payload.role;
        
        if (roleValue) {
          // Converter para número se necessário
          const roleNumber = parseInt(roleValue);
          if (!isNaN(roleNumber) && roleNumber >= 1 && roleNumber <= 3) {
            userType = roleNumber;
          } else {
            // Verificar se é string descritiva
            if (typeof roleValue === 'string') {
              if (roleValue.toLowerCase().includes('fornecedor')) userType = UserType.Fornecedor;
              else if (roleValue.toLowerCase().includes('administrador')) userType = UserType.Administrador;
              else if (roleValue.toLowerCase().includes('consumidor')) userType = UserType.Consumidor;
            }
          }
        }
        
        // Criar objeto de usuário baseado nas claims do token
        const user = {
          id: payload.sub || '', // Subject geralmente é o ID do usuário
          name: payload[`http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name`] || payload.name || '',
          email: payload[`http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress`] || payload.email || '',
          userType: userType
        };
        
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('Erro ao decodificar token JWT:', error);
      }
    } catch (error) {
      console.error('Erro de login:', error);
      throw new Error('Credenciais inválidas');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = () => {
    return !!token;
  };

  const getUserType = () => {
    return user?.userType || null;
  };

  const canAccess = (allowedTypes: UserType[]) => {
    if (!isAuthenticated() || !user) return false;
    return allowedTypes.includes(user.userType);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, getUserType, canAccess }}>
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