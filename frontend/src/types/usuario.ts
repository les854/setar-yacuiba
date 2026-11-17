export interface Usuario {
  id_usuario: number;
  nombre: string;
  usuario: string;
  password?: string;
  rol: "Administrador" | "Tecnico" | "Cliente";
  estado: boolean;
  fecha_registro?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    nombre: string;
    usuario: string;
    rol: string;
  };
}

export interface Sesion {
  id_usuario: number;
  nombre: string;
  usuario: string;
  rol: string;
  token: string;
}