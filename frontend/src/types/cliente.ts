export interface Cliente {
  id_cliente: number;
  nombre: string;
  ci_nit: string;
  direccion: string;
  telefono: string;
  email?: string;
  estado: boolean;
  fecha_registro?: string;
}