// src/services/api.ts
import axios from 'axios';

// Configuração para alternar entre mock e API real
const USE_MOCK = true; // Em produção, você pode usar: process.env.REACT_APP_USE_MOCK === 'true'
const API_URL = 'https://sua-api.com'; // Substitua pela URL real da sua API

// Configuração do cliente axios para chamadas reais à API
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para lidar com erros de autenticação (token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Serviço de autenticação com toggle entre mock e real
export const authService = {
  login: async (email: string, password: string) => {
    if (USE_MOCK) {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock de autenticação para desenvolvimento
      if (email === "test@example.com" && password === "password") {
        const mockResponse = {
          token: "mock-jwt-token-xyz",
          user: { id: "1", name: "Usuário Teste", email }
        };
        
        // Armazenar dados no localStorage, como faria a implementação real
        localStorage.setItem('authToken', mockResponse.token);
        localStorage.setItem('user', JSON.stringify(mockResponse.user));
        
        return mockResponse;
      }
      throw new Error("Credenciais inválidas");
    } else {
      // Implementação real que se conecta ao back-end
      const response = await api.post('/auth/login', { email, password });
      
      // Armazenar token e dados do usuário
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    }
  },
  
  register: async (userData: any) => {
    if (USE_MOCK) {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validação básica
      if (!userData.email || !userData.password || !userData.name) {
        throw new Error("Dados de registro incompletos");
      }
      
      // Simulação de email já existente
      if (userData.email === "existente@example.com") {
        throw new Error("Email já cadastrado");
      }
      
      // Retorna sucesso
      return { success: true, message: "Usuário registrado com sucesso" };
    } else {
      // Implementação real
      const response = await api.post('/auth/register', userData);
      return response.data;
    }
  },
  
  logout: () => {
    // A lógica de logout é a mesma para mock e real:
    // Remove o token e dados do usuário do localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    if (!USE_MOCK) {
      // Se desejar, pode fazer uma chamada à API para invalidar o token no servidor
      // api.post('/auth/logout');
    }
  },
  
  getCurrentUser: () => {
    // Recupera dados do usuário do localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  },
  
  isAuthenticated: () => {
    // Verifica se há um token armazenado
    return !!localStorage.getItem('authToken');
  }
};

// Exporta o cliente axios para uso em outras partes da aplicação
export default api;