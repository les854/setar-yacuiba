import { useEffect, useState } from "react";
import MapaMedidores from "../components/MapaMedidores";
import { medidorService } from "../services/medidorService";
import type { Medidor } from "../types/medidor";

const MapaMedidoresPage: React.FC = () => {
  const [medidores, setMedidores] = useState<Medidor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>("Todos");

  //  Cargar medidores REALES del backend
  useEffect(() => {
    medidorService
      .getAll()
      .then((data) => {
        console.log(" Medidores cargados:", data.length);
        setMedidores(data);
      })
      .catch((err) => {
        console.error(" Error:", err);
        setError(err.response?.data?.error || "Error al cargar medidores");
      })
      .finally(() => setLoading(false));
  }, []);

  const medidoresFiltrados =
    filtroEstado === "Todos"
      ? medidores
      : medidores.filter((m) => m.estado === filtroEstado);

  const estados = ["Todos", "Instalado", "Mantenimiento", "Dañado", "Inactivo"];

  if (loading) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
        Cargando mapa...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-300 text-red-700 rounded-xl p-4 flex items-center">
          <i className="fa-solid fa-circle-exclamation mr-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* =================== TARJETA DEL MAPA =================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header con título y filtros */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <i className="fa-solid fa-map-location-dot text-red-600 mr-2"></i>
              Mapa de Medidores - Yacuiba
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {medidoresFiltrados.length} medidor
              {medidoresFiltrados.length !== 1 ? "es" : ""} mostrado
              {medidoresFiltrados.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Filtros por estado */}
          <div className="flex flex-wrap gap-2">
            {estados.map((estado) => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filtroEstado === estado
                    ? "bg-red-600 text-white shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700"
                }`}
              >
                {estado}
              </button>
            ))}
          </div>
        </div>

        {/* Mapa grande */}
<div className="p-4">
  <MapaMedidores medidores={medidoresFiltrados} altura="600px" />
</div>

        {/* Leyenda inferior */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs text-gray-600">
          <span className="font-semibold text-gray-700">Leyenda:</span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
            Instalado
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>
            Mantenimiento
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span>
            Dañado
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-gray-500 rounded-full mr-1"></span>
            Inactivo
          </span>
        </div>
      </div>

      {/* =================== TABLA RESUMEN =================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <i className="fa-solid fa-list text-red-600 mr-2"></i>
            Lista de Medidores en el Mapa
          </h3>
        </div>

        <div className="p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-gray-500 text-sm">
                <th className="py-3 px-2">Código</th>
                <th className="py-3 px-2">Cliente</th>
                <th className="py-3 px-2">Dirección</th>
                <th className="py-3 px-2">Latitud</th>
                <th className="py-3 px-2">Longitud</th>
                <th className="py-3 px-2">Estado</th>
                <th className="py-3 px-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {medidoresFiltrados.map((m, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-2 font-mono text-xs">
                    {m.codigo_medidor}
                  </td>
                  <td className="py-3 px-2">
                    {m.cliente_nombre || "Sin cliente"}
                  </td>
                  <td className="py-3 px-2 text-gray-500">{m.direccion}</td>
                  <td className="py-3 px-2 font-mono text-xs text-gray-400">
                    {Number(m.latitud).toFixed(6)}
                  </td>
                  <td className="py-3 px-2 font-mono text-xs text-gray-400">
                    {Number(m.longitud).toFixed(6)}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        m.estado === "Instalado"
                          ? "bg-green-100 text-green-700"
                          : m.estado === "Mantenimiento"
                          ? "bg-yellow-100 text-yellow-700"
                          : m.estado === "Dañado"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {m.estado}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${m.latitud},${m.longitud}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 font-semibold text-xs inline-flex items-center gap-1"
                    >
                      <i className="fa-solid fa-map-location-dot"></i>
                      Ver en Maps
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MapaMedidoresPage;