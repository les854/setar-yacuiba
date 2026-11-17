// src/config/permisos.ts

export type Rol = "Administrador" | "Tecnico" | "Cliente";

export const RUTAS_POR_ROL: Record<Rol, string[]> = {
  Administrador: [
    "/",
    "/mapa",
    "/medidores",
    "/clientes",
    "/usuarios",
    "/tecnicos",
    "/reportes",
    "/calendario",
    "/about",
  ],
  Tecnico: [
    "/mi-panel",
    "/mi-mapa",
    "/mis-medidores",
    "/mi-calendario",
    "/about",
  ],
  Cliente: [
    "/mi-inicio",
    "/mi-consumo",
    "/mi-facturacion",
    "/mi-pago",
    "/mi-perfil",
    "/reclamos",
    "/about",
  ],
};

export const puedeVerRuta = (rol: string, ruta: string): boolean => {
  const permisos = RUTAS_POR_ROL[rol as Rol];
  if (!permisos) return false;
  if (permisos.includes(ruta)) return true;
  return permisos.some((p) => ruta.startsWith(p) && p !== "/");
};

export const filtrarMenuPorRol = <T extends { url: string }>(
  menu: T[],
  rol: string
): T[] => {
  return menu.filter((item) => puedeVerRuta(rol, item.url));
};

export const rutaInicioPorRol = (rol: string): string => {
  switch (rol) {
    case "Administrador":
      return "/";
    case "Tecnico":
      return "/mi-panel";
    case "Cliente":
      return "/mi-inicio";
    default:
      return "/login";
  }
};