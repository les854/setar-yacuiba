import apiClient from "../api/apiCliente";
import type { Tecnico } from "../types/tecnico";

export const tecnicoService = {
  getAll: async (): Promise<Tecnico[]> => {
    const response = await apiClient.get<Tecnico[]>("/tecnicos");
    return response.data;
  },

  getById: async (id: number): Promise<Tecnico> => {
    const response = await apiClient.get<Tecnico>(`/tecnicos/${id}`);
    return response.data;
  },

  create: async (data: Omit<Tecnico, "id_tecnico">): Promise<Tecnico> => {
    const response = await apiClient.post<Tecnico>("/tecnicos", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Tecnico>): Promise<Tecnico> => {
    const response = await apiClient.put<Tecnico>(`/tecnicos/${id}`, data);
    return response.data;
  },

  // 🎯 NUEVOS MÉTODOS
  desactivar: async (id: number): Promise<void> => {
    await apiClient.patch(`/tecnicos/${id}/desactivar`);
  },

  reactivar: async (id: number): Promise<void> => {
    await apiClient.patch(`/tecnicos/${id}/reactivar`);
  },

  eliminarDefinitivo: async (id: number): Promise<void> => {
    await apiClient.delete(`/tecnicos/${id}/definitivo`);
  },

  // Método antiguo (por compatibilidad)
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/tecnicos/${id}`);
  },
};