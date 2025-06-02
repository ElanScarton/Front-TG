import api from '../data/api'; // Assuming api.ts is in the same directory

// Define an interface for the Product data structure.
// Adjust this based on the actual structure of your product data.
interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: string;
  cpf: string;
  cnpj: string;
  ativo: boolean;
  dataCriacao: string;
}

// Function to fetch all products
export const getUsuarios = async (): Promise<Usuario[]> => {
  try {
    const response = await api.get<Usuario[]>('/Usuarios');
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    
    throw error;
  }
};