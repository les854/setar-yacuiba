export interface Medidor {
  id_medidor?: number;
  codigo_medidor: string;
  numero_serie: string;
  direccion: string;
  marca: string;
  modelo: string;
  latitud: number;
  longitud: number;
  fecha_instalacion: string;
  estado: string;
  observaciones?: string;
  id_cliente: number;
  id_tecnico: number;
  id_usuario_registro: number;
  cliente_nombre?: string;
}