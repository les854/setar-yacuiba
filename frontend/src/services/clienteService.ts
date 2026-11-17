import apiClient from "../api/apiCliente";
import type { Cliente } from "../types/cliente";

export const clienteService = {
  getAll: async (): Promise<Cliente[]> => {
    const response = await apiClient.get<Cliente[]>("/clientes");
    return response.data;
  },

  getById: async (id: number): Promise<Cliente> => {
    const response = await apiClient.get<Cliente>(`/clientes/${id}`);
    return response.data;
  },

  create: async (data: Omit<Cliente, "id_cliente">): Promise<Cliente> => {
    const response = await apiClient.post<Cliente>("/clientes", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Cliente>): Promise<Cliente> => {
    const response = await apiClient.put<Cliente>(`/clientes/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/clientes/${id}`);
  },
};