import apiClient from "../api/apiCliente";
import type { Medidor } from "../types/medidor";

export const medidorService = {
  getAll: async (): Promise<Medidor[]> => {
    const response = await apiClient.get<Medidor[]>("/medidores");
    return response.data;
  },

  getGeo: async (): Promise<Medidor[]> => {
    const response = await apiClient.get<Medidor[]>("/medidores/geo");
    return response.data;
  },

  getById: async (id: number): Promise<Medidor> => {
    const response = await apiClient.get<Medidor>(`/medidores/${id}`);
    return response.data;
  },

  create: async (data: Omit<Medidor, "id_medidor">): Promise<Medidor> => {
    const response = await apiClient.post<Medidor>("/medidores", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Medidor>): Promise<Medidor> => {
    const response = await apiClient.put<Medidor>(`/medidores/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/medidores/${id}`);
  },

  eliminarDefinitivo: async (id: number): Promise<void> => {
    await apiClient.delete(`/medidores/${id}/definitivo`);
  },

  getMisMedidores: async (): Promise<Medidor[]> => {
    const response = await apiClient.get<Medidor[]>("/medidores/mis-medidores");
    return response.data;
  },
};