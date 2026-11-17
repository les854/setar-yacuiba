import apiClient from "../api/apiCliente";

export interface Tarea {
  id_tarea: number;
  id_tecnico: number;
  id_usuario_creador: number;
  id_medidor?: number;
  titulo: string;
  descripcion?: string;
  tipo: "Lectura" | "Mantenimiento" | "Instalación" | "Reconexión" | "Corte";
  fecha_programada: string;
  hora_programada: string;
  estado: "Pendiente" | "En progreso" | "Completada" | "Cancelada";
  prioridad: "Baja" | "Normal" | "Alta" | "Urgente";
  notificacion_leida: boolean;
  fecha_creacion?: string;
  fecha_completada?: string;
  tecnico_nombre?: string;
  tecnico_especialidad?: string;
  creador_nombre?: string;
  codigo_medidor?: string;
  medidor_direccion?: string;
}

export const tareaService = {
  getAll: async (filtros?: { id_tecnico?: number; estado?: string; fecha?: string }): Promise<Tarea[]> => {
    const params = new URLSearchParams();
    if (filtros?.id_tecnico) params.append("id_tecnico", String(filtros.id_tecnico));
    if (filtros?.estado) params.append("estado", filtros.estado);
    if (filtros?.fecha) params.append("fecha", filtros.fecha);
    
    const url = params.toString() ? `/tareas?${params}` : "/tareas";
    const response = await apiClient.get<Tarea[]>(url);
    return response.data;
  },

  getByTecnico: async (idTecnico: number): Promise<Tarea[]> => {
    const response = await apiClient.get<Tarea[]>(`/tareas/tecnico/${idTecnico}`);
    return response.data;
  },

  getById: async (id: number): Promise<Tarea> => {
    const response = await apiClient.get<Tarea>(`/tareas/${id}`);
    return response.data;
  },

  create: async (data: Partial<Tarea>): Promise<Tarea> => {
    const response = await apiClient.post<Tarea>("/tareas", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Tarea>): Promise<Tarea> => {
    const response = await apiClient.put<Tarea>(`/tareas/${id}`, data);
    return response.data;
  },

  cambiarEstado: async (id: number, estado: string): Promise<Tarea> => {
    const response = await apiClient.patch<Tarea>(`/tareas/${id}/estado`, { estado });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/tareas/${id}`);
  },

  // 🎯 Notificaciones del técnico logueado
  getMisNotificaciones: async (): Promise<Tarea[]> => {
    const response = await apiClient.get<Tarea[]>("/tareas/mis-notificaciones");
    return response.data;
  },

  marcarLeida: async (id: number): Promise<Tarea> => {
    const response = await apiClient.patch<Tarea>(`/tareas/${id}/leer`);
    return response.data;
  },
};