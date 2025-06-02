import api from '../data/api';

// Define an interface for the Lance data structure
interface Lance {
  id?: number;
  valor: number;
  vencedor?: boolean;
  observacao?: string;
  usuarioId: number;
  leilaoId: number;
  dataCriacao?: string;
}

// Function to fetch all lances
export const getLances = async (): Promise<Lance[]> => {
  try {
    const response = await api.get<Lance[]>('/Lances');
    // Validação básica para garantir que o retorno seja um array
    if (!Array.isArray(response.data)) {
      throw new Error("Dados retornados não são um array válido");
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching lances:", error);
    throw error;
  }
};

// Function to fetch a specific lance by id
export const getLanceById = async (id: number): Promise<Lance> => {
  try {
    const response = await api.get<Lance>(`/Lances/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching lance by id:", error);
    throw error;
  }
};

// Function to create a new lance
export const createLance = async (lanceData: Lance): Promise<Lance> => {
  try {
    const response = await api.post<Lance>('/Lances', {
      valor: lanceData.valor,
      vencedor: lanceData.vencedor || false,
      observacao: lanceData.observacao,
      usuarioId: lanceData.usuarioId,
      leilaoId: lanceData.leilaoId
    });
    return response.data;
  } catch (error) {
    console.error("Error creating lance:", error);
    throw error;
  }
};

// Function to update a lance by id
export const updateLance = async (id: number, lanceData: Lance): Promise<Lance> => {
  try {
    const response = await api.put<Lance>(`/Lances/${id}`, {
      valor: lanceData.valor,
      vencedor: lanceData.vencedor,
      observacao: lanceData.observacao,
      usuarioId: lanceData.usuarioId,
      leilaoId: lanceData.leilaoId
    });
    return response.data;
  } catch (error) {
    console.error("Error updating lance:", error);
    throw error;
  }
};

// Function to delete a lance by id
export const deleteLance = async (id: number): Promise<void> => {
  try {
    await api.delete(`/Lances/${id}`);
  } catch (error) {
    console.error("Error deleting lance:", error);
    throw error;
  }
};

export const updateVencedor = async (id: number, vencedor: boolean): Promise<void> => {
  try {
    await api.patch(`/Lances/${id}/vencedor`, { vencedor });
  } catch (error) {
    console.error("Error updating vencedor:", error);
    throw error;
  }
};