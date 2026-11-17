import apiClient from "../api/apiCliente";
import type { Usuario } from "../types/usuario";

export const usuarioService = {
  getAll: async (): Promise<Usuario[]> => {
    const response = await apiClient.get<Usuario[]>("/usuarios");
    return response.data;
  },

  getById: async (id: number): Promise<Usuario> => {
    const response = await apiClient.get<Usuario>(`/usuarios/${id}`);
    return response.data;
  },

  create: async (data: Omit<Usuario, "id_usuario">): Promise<Usuario> => {
    const response = await apiClient.post<Usuario>("/usuarios", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Usuario>): Promise<Usuario> => {
    const response = await apiClient.put<Usuario>(`/usuarios/${id}`, data);
    return response.data;
  },

  desactivar: async (id: number): Promise<void> => {
    await apiClient.patch(`/usuarios/${id}/desactivar`);
  },

  reactivar: async (id: number): Promise<void> => {
    await apiClient.patch(`/usuarios/${id}/reactivar`);
  },

  eliminarDefinitivo: async (id: number): Promise<void> => {
    await apiClient.delete(`/usuarios/${id}/definitivo`);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/usuarios/${id}`);
  },
};