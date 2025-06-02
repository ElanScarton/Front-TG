import api from '../data/api';

// Define an interface for the Leilao data structure
interface Leilao {
  id?: number;
  titulo: string;
  descricao: string;
  precoInicial: number;
  precoFinal: number;
  dataInicio: string;
  dataTermino: string;
  dataEntrega: string;
  status: number;
  produtoId: number;
  usuarioId?: number;
}

// Function to fetch all leiloes
export const getLeiloes = async (): Promise<Leilao[]> => {
  try {
    const response = await api.get<Leilao[]>('/Leiloes');
    return response.data;
  } catch (error) {
    console.error("Error fetching leiloes:", error);
    throw error;
  }
};

// Function to fetch a specific leilao by id
export const getLeilaoById = async (id: number): Promise<Leilao> => {
  try {
    const response = await api.get<Leilao>(`/Leiloes/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching leilao by id:", error);
    throw error;
  }
};

// Function to create a new leilao
export const createLeilao = async (leilaoData: Leilao): Promise<Leilao> => {
  try {
    const response = await api.post<Leilao>('/Leiloes', {
      titulo: leilaoData.titulo,
      descricao: leilaoData.descricao,
      precoInicial: leilaoData.precoInicial,
      dataInicio: leilaoData.dataInicio,
      dataTermino: leilaoData.dataTermino,
      dataEntrega: leilaoData.dataEntrega,
      produtoId: leilaoData.produtoId,
      usuarioId: leilaoData.usuarioId
    });
    return response.data;
  } catch (error) {
    console.error("Error creating leilao:", error);
    throw error;
  }
};

// Function to update a leilao by id
export const updateLeilao = async (id: number, leilaoData: Leilao): Promise<Leilao> => {
  try {
    const response = await api.put<Leilao>(`/Leiloes/${id}`, {
      titulo: leilaoData.titulo,
      descricao: leilaoData.descricao,
      precoInicial: leilaoData.precoInicial,
      dataInicio: leilaoData.dataInicio,
      dataTermino: leilaoData.dataTermino,
      dataEntrega: leilaoData.dataEntrega
    });
    return response.data;
  } catch (error) {
    console.error("Error updating leilao:", error);
    throw error;
  }
};

// Function to delete a leilao by id
export const deleteLeilao = async (id: number): Promise<void> => {
  try {
    await api.delete(`/Leiloes/${id}`);
  } catch (error) {
    console.error("Error deleting leilao:", error);
    throw error;
  }
};

export const getFornLeiloes = async (id: number): Promise<Leilao[]> => {
  try {
    const response = await api.get<Leilao[]>(`/Leiloes/fornecedor/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching leiloes:", error);
    throw error;
  }
};

// Function to assign suppliers to an auction
export const assignSuppliersToAuction = async (leilaoId: number, fornecedoresIds: number[]) => {
  console.log('Enviando para API - leilaoId:', leilaoId, 'fornecedoresIds:', fornecedoresIds);
  
  try {
    const response = await api.patch(`/leiloes/${leilaoId}/fornecedores`, {
      usuariosIds: fornecedoresIds
    });
    console.log('Resposta da API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Detalhes do erro:', {
      request: error.config,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};