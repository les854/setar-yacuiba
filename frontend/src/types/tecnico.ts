export interface Tecnico {
  id_tecnico: number;
  id_usuario: number;
  nombre: string;
  telefono: string;
  especialidad: string;
  estado: boolean;
  usuario?: string;
}