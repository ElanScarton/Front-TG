import api from '../data/api';
import { UserType } from '../contexts/AuthContext';

// Interface para os dados de registro
export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  cnpj?: string;
  cpf?: string;
  tipoUsuario: UserType;
}

// Interface para a resposta da API
export interface RegisterResponse {
  id: number;
  nome: string;
  email: string;
  cnpj: string;
  cpf: string;
  tipoUsuario: number;
  ativo: boolean;
  dataCriacao: string;
}

// Interface para dados do usuário (busca por ID)
export interface UserData {
  id: number;
  nome: string;
  email: string;
  cnpj: string;
  cpf: string;
  tipoUsuario: number;
  ativo: boolean;
  dataCriacao: string;
}

// Interface para atualização de dados do usuário
export interface UpdateUserData {
  nome: string;
  email: string;
  cnpj?: string;
  cpf?: string;
  senha?: string;
  tipoUsuario: number;
  senhaAtual: string; // Senha atual para confirmação
}

// Função para registrar um novo usuário
export const registerUser = async (userData: RegisterData): Promise<RegisterResponse> => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await api.post<RegisterResponse>('/Usuarios', {
      id: 0, // O ID será gerado pela API
      nome: userData.nome,
      email: userData.email,
      senha: userData.senha,
      cnpj: userData.cnpj || "",
      cpf: userData.cpf || "",
      tipoUsuario: userData.tipoUsuario,
      ativo: true,
      dataCriacao: new Date().toISOString(),
      lances: [],
      leiloes: []
    });

    return response.data;
  } catch (error) {
    // Re-throw the error para ser tratado no componente
    throw error;
  }
};

// Função para buscar usuário por ID
export const getUserById = async (userId: number): Promise<UserData> => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await api.get<UserData>(`/Usuarios/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Função para atualizar dados do usuário
export const updateUser = async (userId: number, userData: UpdateUserData): Promise<UserData> => {
  try {
    // Buscar dados atuais do usuário para completar as informações
    const currentUserData = await getUserById(userId);
    
    // Prepara os dados completos para envio conforme esperado pela API
    const updatePayload = {
      nome: userData.nome || currentUserData.nome,
      email: userData.email || currentUserData.email,
      cpf: userData.cpf || currentUserData.cpf || "",
      cnpj: userData.cnpj || currentUserData.cnpj || "",
      tipoUsuario: userData.tipoUsuario || currentUserData.tipoUsuario,
      // Para validação, incluir a senha atual
      senhaAtual: userData.senhaAtual
    };

    // Adiciona nova senha apenas se foi fornecida
   // if (userData.senha && userData.senha.trim() !== '') {
   //   updatePayload.senha = userData.senha;
   // }

    const response = await api.put<UserData>(`/Usuarios/${userId}`, updatePayload);
    return response.data;
  } catch (error) {
    console.error('Erro no updateUser:', error);
    
    // Tratamento específico para diferentes tipos de erro
   // if (error.response?.status === 401) {
   //   throw new Error('Senha atual incorreta');
    //} else if (error.response?.status === 400) {
     // const errorMessage = error.response?.data?.message || error.response?.data || 'Dados inválidos';
      
      // Verificar se é erro de senha fraca
    //  if (errorMessage.includes('senha') || errorMessage.includes('password')) {
    //    throw new Error('Senha fraca. Use no mínimo 8 caracteres, com letra maiúscula, minúscula, número e símbolo.');
    //  }
      
    //  throw new Error(errorMessage);
    //} else if (error.response?.status === 422) {
     // throw new Error('Dados de entrada inválidos. Verifique as informações fornecidas.');
    //}
    
    throw error;
  }
};

// Função alternativa caso a API não aceite senhaAtual
export const updateUserAlternative = async (userId: number, userData: UpdateUserData): Promise<UserData> => {
  try {
    // Buscar dados atuais do usuário para completar as informações
    const currentUserData = await getUserById(userId);
    
    // Prepara os dados completos para envio conforme o formato esperado
    const updatePayload = {
      nome: userData.nome || currentUserData.nome,
      email: userData.email || currentUserData.email,
      cpf: userData.cpf || currentUserData.cpf || "",
      cnpj: userData.cnpj || currentUserData.cnpj || "",
      tipoUsuario: userData.tipoUsuario !== undefined ? userData.tipoUsuario : currentUserData.tipoUsuario
    };

    // Adiciona nova senha apenas se foi fornecida
    //if (userData.senha && userData.senha.trim() !== '') {
    //  updatePayload.senha = userData.senha;
    //}

    const response = await api.put<UserData>(`/Usuarios/${userId}`, updatePayload);
    return response.data;
  } catch (error) {
    console.error('Erro no updateUserAlternative:', error);
    throw error;
  }
};

// Função para validar senha atual (se a API tiver endpoint específico)
export const validateCurrentPassword = async (userId: number, password: string): Promise<boolean> => {
  try {
    const response = await api.post(`/Usuarios/${userId}/validate-password`, {
      senha: password
    });
    return response.data.valid;
  } catch (error) {
    console.error('Erro ao validar senha:', error);
    return false;
  }
};

// Função para validar CPF (opcional - implementação básica)
export const validateCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação básica dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
};

// Função para validar CNPJ (opcional - implementação básica)
export const validateCNPJ = (cnpj: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  
  // Validação básica dos dígitos verificadores
  let length = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, length);
  const digits = cleanCNPJ.substring(length);
  let sum = 0;
  let pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  length = length + 1;
  numbers = cleanCNPJ.substring(0, length);
  sum = 0;
  pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
};

// Função para formatar CPF
export const formatCPF = (cpf: string): string => {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

// Função para formatar CNPJ
export const formatCNPJ = (cnpj: string): string => {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  return cleanCNPJ.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};