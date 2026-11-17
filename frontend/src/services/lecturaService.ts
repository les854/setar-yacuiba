import apiClient from "../api/apiCliente";

export interface Lectura {
  id_lectura: number;
  id_medidor: number;
  id_tecnico: number;
  fecha_lectura: string;
  lectura_anterior: number;
  lectura_actual: number;
  consumo: number;
  observaciones?: string;
  fecha_registro?: string;
  codigo_medidor?: string;
  tecnico_nombre?: string;
}

export const lecturaService = {
  getAll: async (): Promise<Lectura[]> => {
    const response = await apiClient.get<Lectura[]>("/lecturas");
    return response.data;
  },

  getByMedidor: async (idMedidor: number): Promise<Lectura[]> => {
    const response = await apiClient.get<Lectura[]>(
      `/lecturas/medidor/${idMedidor}`
    );
    return response.data;
  },

  getUltimaLectura: async (idMedidor: number): Promise<Lectura | null> => {
    const response = await apiClient.get<Lectura | null>(
      `/lecturas/medidor/${idMedidor}/ultima`
    );
    return response.data;
  },

  create: async (data: {
    id_medidor: number;
    id_tecnico: number;
    lectura_actual: number;
    observaciones?: string;
  }): Promise<Lectura> => {
    const response = await apiClient.post<Lectura>("/lecturas", data);
    return response.data;
  },
};