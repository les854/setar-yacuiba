// Marcas y sus modelos
export const MARCAS_MODELOS: Record<string, string[]> = {
  Actaris: ["X300", "X500", "SL700"],
  Diehl: ["Altair", "Hydrus", "x225"],
  Holley: ["DDS28", "DDSY", "H100"],
  "Landis+Gyr": ["x225", "E350", "E450"],
  Itron: ["Aquadis", "Cyble", "SL700"],
  Sensus: ["iPERL", "OMNI", "SRII"],
};

// Estados disponibles
export const ESTADOS_MEDIDOR = [
  "Instalado",
  "Mantenimiento",
  "Dañado",
  "En revisión",
  "Inactivo",
] as const;

// Genera códigos disponibles a partir de un número base
export function generarCodigosDisponibles(ultimo: number, cantidad = 30): string[] {
  const codigos: string[] = [];
  for (let i = 1; i <= cantidad; i++) {
    codigos.push(`MED-${String(ultimo + i).padStart(4, "0")}`);
  }
  return codigos;
}

// Genera serie a partir del código. Ej: MED-0051 → SN-2000051
export function serieDesdeCodigo(codigo: string): string {
  const num = codigo.replace("MED-", "").replace(/^0+/, "");
  return `SN-20000${num}`;
}