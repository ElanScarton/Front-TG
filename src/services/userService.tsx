import api from "../data/api";

// Exemplo de serviço para usuários (exceto autenticação)
export const userService = {
  getProfile: async () => {
    const response = await api.get('/usuarios/profile');
    return response.data;
  },
  
  updateProfile: async (userData: any) => {
    const response = await api.put('/usuarios/profile', userData);
    return response.data;
  }
};