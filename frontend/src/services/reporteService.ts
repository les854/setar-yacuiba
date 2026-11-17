import apiClient from "../api/apiCliente";

export interface Resumen {
  usuariosActivos: number;
  tecnicosActivos: number;
  clientesActivos: number;
  totalMedidores: number;
  totalLecturas: number;
}

export interface MedidorPorEstado {
  estado: string;
  total: number;
}

export interface MedidorPorMarca {
  marca: string;
  total: number;
}

export interface ClientePorEstado {
  tipo: string;
  total: number;
}

export interface LecturaPorMes {
  mes: string;
  total: number;
  consumo: number;
}

export interface TopMedidor {
  codigo: string;
  direccion: string;
  estado: string;
  totalLecturas: number;
  consumoTotal: number;
}

export interface ReporteCompleto {
  resumen: Resumen;
  medidoresPorEstado: MedidorPorEstado[];
  medidoresPorMarca: MedidorPorMarca[];
  clientesPorEstado: ClientePorEstado[];
  lecturasPorMes: LecturaPorMes[];
  topMedidores: TopMedidor[];
}

export const reporteService = {
  getTodo: async (): Promise<ReporteCompleto> => {
    const response = await apiClient.get<ReporteCompleto>("/reportes/todo");
    return response.data;
  },

  getResumen: async (): Promise<Resumen> => {
    const response = await apiClient.get<Resumen>("/reportes/resumen");
    return response.data;
  },
};