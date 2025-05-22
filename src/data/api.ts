import axios from 'axios';

// Configuração da API
const API_URL = 'http://localhost:5102/api';

// Configuração do cliente axios para chamadas à API
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Função que será usada para obter o token atual
// Inicialmente definida para obter do localStorage, mas pode ser sobrescrita
let tokenProvider = () => localStorage.getItem('token');

// Função que será chamada em caso de erro de autenticação
let handleAuthError = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// Permite que o AuthContext sobrescreva como obtemos o token
export const setTokenProvider = (provider: () => string | null) => {
  tokenProvider = provider;
};

// Permite que o AuthContext sobrescreva como lidamos com erros de autenticação
export const setAuthErrorHandler = (handler: () => void) => {
  handleAuthError = handler;
};

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = tokenProvider();
  if (token) {
    config.headers = config.headers || {};
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
      handleAuthError();
    }
    return Promise.reject(error);
  }
);

// Exporta o cliente axios como padrão
export default api;