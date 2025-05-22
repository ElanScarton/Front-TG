import api from '../data/api'; // Importa a instância do axios configurada
import { User, UserType } from '../contexts/AuthContext'; // Importa tipos do authContext

export const login = async (email: string, senha: string): Promise<{ token: string; user: User }> => {
  try {
    // Usando a instância do axios configurada no api.ts
    const response = await api.post('/auth', {
      email,
      senha,
    });

    // O backend retorna apenas o token
    const token = response.data;

    if (!token) {
      throw new Error('Token não retornado pelo servidor');
    }

    // Extrair informações do usuário do token JWT (parte payload)
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));

      // Recuperar o tipo de usuário da role
      let userType = UserType.CONSUMIDOR; // Valor padrão
      const roleValue =
        payload[`http://schemas.microsoft.com/ws/2008/06/identity/claims/role`] ||
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
            if (roleValue.toLowerCase().includes('fornecedor')) userType = UserType.FORNECEDOR;
            else if (roleValue.toLowerCase().includes('administrador')) userType = UserType.ADIMINISTRADOR;
            else if (roleValue.toLowerCase().includes('consumidor')) userType = UserType.CONSUMIDOR;
          }
        }
      }

      // Criar objeto de usuário baseado nas claims do token
      const user = {
        id: payload.sub || '', // Subject geralmente é o ID do usuário
        name: payload[`http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name`] || payload.name || '',
        email: payload[`http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress`] || payload.email || '',
        userType: userType,
      };

      // Armazenar token e usuário no localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return { token, user };
    } catch (error) {
      console.error('Erro ao decodificar token JWT:', error);
      throw new Error('Erro ao processar token');
    }
  } catch (error) {
    console.error('Erro de login:', error);
    throw new Error('Credenciais inválidas');
  }
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = (token: string | null): boolean => {
  return !!token;
};

export const getUserType = (user: User | null): UserType | null => {
  return user?.userType || null;
};

export const canAccess = (user: User | null, allowedTypes: UserType[]): boolean => {
  if (!user) return false;
  return allowedTypes.includes(user.userType);
};