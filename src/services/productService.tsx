import api from '../data/api'; // Assuming api.ts is in the same directory

// Define an interface for the Product data structure.
// Adjust this based on the actual structure of your product data.
export interface Product {
  id: number;
  nome: string;
  quantidade: number;
  valor: number;
  descricao: string;
  area: string
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

// Function to fetch all products
export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get<Product[]>('/produtos');
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    
    throw error;
  }
};