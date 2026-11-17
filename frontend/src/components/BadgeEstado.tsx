interface Props {
  estado: string;
}

const BadgeEstado: React.FC<Props> = ({ estado }) => {
  const estilos: Record<string, string> = {
    Instalado: "bg-green-100 text-green-700",
    Mantenimiento: "bg-yellow-100 text-yellow-700",
    Inactivo: "bg-gray-100 text-gray-700",
    Dañado: "bg-red-100 text-red-700",
    "En revisión": "bg-blue-100 text-blue-700",
    Activo: "bg-green-100 text-green-700",
    Ocupado: "bg-yellow-100 text-yellow-700",
  };

  const clase = estilos[estado] || "bg-gray-100 text-gray-700";

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${clase}`}>
      {estado}
    </span>
  );
};

export default BadgeEstado;