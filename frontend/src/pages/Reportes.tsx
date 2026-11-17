import { useEffect, useState } from "react";
import {
  reporteService,
  type ReporteCompleto,
} from "../services/reporteService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#dc2626", "#ef4444", "#f87171", "#fca5a5", "#fecaca", "#fbbf24"];
const ESTADO_COLORS: Record<string, string> = {
  Instalado: "#22c55e",
  Mantenimiento: "#eab308",
  Dañado: "#ef4444",
  Inactivo: "#6b7280",
  "En revisión": "#3b82f6",
};

const Reportes: React.FC = () => {
  const [data, setData] = useState<ReporteCompleto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refrescando, setRefrescando] = useState(false);

  const cargarDatos = async () => {
    try {
      setRefrescando(true);
      const resultado = await reporteService.getTodo();
      setData(resultado);
      setError(null);
    } catch (err: any) {
      console.error("Error al cargar reportes:", err);
      setError(err.response?.data?.error || "Error al cargar reportes");
    } finally {
      setLoading(false);
      setRefrescando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
        Cargando reportes...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-300 text-red-700 rounded-xl p-4 flex items-center justify-between">
          <div>
            <i className="fa-solid fa-circle-exclamation mr-2"></i>
            {error || "No hay datos disponibles"}
          </div>
          <button
            onClick={cargarDatos}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const { resumen } = data;

  const kpis = [
    {
      label: "Usuarios Activos",
      value: resumen.usuariosActivos,
      icon: "fa-user-gear",
    },
    {
      label: "Técnicos Activos",
      value: resumen.tecnicosActivos,
      icon: "fa-screwdriver-wrench",
    },
    {
      label: "Clientes Activos",
      value: resumen.clientesActivos,
      icon: "fa-users",
    },
    {
      label: "Total Medidores",
      value: resumen.totalMedidores,
      icon: "fa-gauge-high",
    },
    {
      label: "Lecturas Registradas",
      value: resumen.totalLecturas,
      icon: "fa-clipboard-list",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-red-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <i className="fa-solid fa-chart-line mr-2"></i>
              Reportes y Estadísticas
            </h1>
            <p className="text-red-100 text-sm mt-1">
              Resumen general del sistema SETAR Yacuiba
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={cargarDatos}
              disabled={refrescando}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 disabled:opacity-50"
            >
              <i className={`fa-solid fa-rotate ${refrescando ? "fa-spin" : ""}`}></i>
              {refrescando ? "Actualizando..." : "Actualizar"}
            </button>
            <button
              onClick={() => window.print()}
              className="bg-white text-red-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-50 transition flex items-center gap-2"
            >
              <i className="fa-solid fa-print"></i>
              Imprimir
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-red-600"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="h-10 w-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                <i className={`fa-solid ${kpi.icon}`}></i>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              {kpi.label}
            </p>
            <h3 className="text-3xl font-bold text-gray-800 mt-1">
              {kpi.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Gráfico: Medidores por estado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <i className="fa-solid fa-chart-bar text-red-600 mr-2"></i>
            Medidores por Estado
          </h3>
          {data.medidoresPorEstado.length === 0 ? (
            <p className="text-center text-gray-400 py-12">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.medidoresPorEstado}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="estado"
                  tick={{ fontSize: 11 }}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]} name="Medidores">
                  {data.medidoresPorEstado.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={ESTADO_COLORS[entry.estado] || "#dc2626"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Gráfico: Clientes por estado */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <i className="fa-solid fa-chart-pie text-red-600 mr-2"></i>
            Clientes por Estado
          </h3>
          {data.clientesPorEstado.length === 0 ? (
            <p className="text-center text-gray-400 py-12">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.clientesPorEstado}
                  dataKey="total"
                  nameKey="tipo"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  label={(props: any) => `${props.tipo}: ${props.total}`}
                  labelLine={false}
                >
                  {data.clientesPorEstado.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.tipo === "Activos" ? "#22c55e" : "#6b7280"}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Gráfico: Medidores por marca */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center">
          <i className="fa-solid fa-tags text-red-600 mr-2"></i>
          Medidores por Marca
        </h3>
        {data.medidoresPorMarca.length === 0 ? (
          <p className="text-center text-gray-400 py-12">Sin datos</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.medidoresPorMarca} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" />
              <YAxis
                dataKey="marca"
                type="category"
                width={110}
                tick={{ fontSize: 11 }}
              />
              <Tooltip />
              <Bar dataKey="total" radius={[0, 8, 8, 0]} name="Medidores">
                {data.medidoresPorMarca.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Gráfico: Lecturas por mes */}
      {data.lecturasPorMes.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <i className="fa-solid fa-chart-line text-red-600 mr-2"></i>
            Lecturas y Consumo por Mes
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.lecturasPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="total"
                stroke="#dc2626"
                strokeWidth={3}
                name="Lecturas"
                dot={{ r: 5, fill: "#dc2626" }}
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="consumo"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Consumo (kWh)"
                dot={{ r: 5, fill: "#3b82f6" }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabla: Top medidores */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 flex items-center">
            <i className="fa-solid fa-trophy text-red-600 mr-2"></i>
            Top 10 Medidores con más Lecturas
          </h3>
          <span className="text-xs text-gray-500">
            {data.topMedidores.length} registros
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr className="text-gray-500 text-xs uppercase">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Dirección</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Lecturas</th>
                <th className="py-3 px-4 text-right">Consumo Total</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
              {data.topMedidores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <i className="fa-solid fa-inbox text-4xl mb-2 block"></i>
                    No hay datos de lecturas todavía
                  </td>
                </tr>
              ) : (
                data.topMedidores.map((m, i) => (
                  <tr key={i} className="hover:bg-red-50/40">
                    <td className="py-3 px-4 font-bold">
                      {i === 0 ? "" : i === 1 ? "" : i === 2 ? "" : i + 1}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs font-bold text-red-700">
                      {m.codigo}
                    </td>
                    <td className="py-3 px-4 text-gray-500">{m.direccion}</td>
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      {m.totalLecturas}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-red-600">
                      {m.consumoTotal.toFixed(2)} kWh
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen final */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center">
          <i className="fa-solid fa-circle-info text-red-600 mr-2"></i>
          Resumen del Sistema
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-red-600">
              {resumen.totalMedidores}
            </p>
            <p className="text-xs text-gray-500 uppercase">Medidores</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {resumen.clientesActivos}
            </p>
            <p className="text-xs text-gray-500 uppercase">Clientes</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">
              {resumen.tecnicosActivos}
            </p>
            <p className="text-xs text-gray-500 uppercase">Técnicos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {resumen.totalLecturas}
            </p>
            <p className="text-xs text-gray-500 uppercase">Lecturas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reportes;