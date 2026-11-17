import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { medidorService } from "../services/medidorService";
import { lecturaService } from "../services/lecturaService";
import type { Medidor } from "../types/medidor";
import { tareaService, type Tarea } from "../services/tareaService";

const MiPanel: React.FC = () => {
  const navigate = useNavigate();
  const [sesion, setSesion] = useState<any>(null);
  const [medidores, setMedidores] = useState<Medidor[]>([]);
  const [lecturasHoy, setLecturasHoy] = useState(0);
  const [tareasPendientes, setTareasPendientes] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);

  const hoy = new Date();
  const fechaFormateada = hoy.toLocaleDateString("es-BO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hora = hoy.getHours();
  const saludo =
    hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";

  useEffect(() => {
  const s = localStorage.getItem("usuario");
  if (s) setSesion(JSON.parse(s));

  Promise.all([
    medidorService.getMisMedidores(),
    lecturaService.getAll().catch(() => []),
    tareaService.getMisNotificaciones().catch(() => []),  
  ])
    .then(([meds, lecturas, tareasNotif]) => {
      setMedidores(meds);
      const hoyStr = new Date().toISOString().split("T")[0];
      const lecturasDelDia = lecturas.filter(
        (l) => l.fecha_lectura?.split("T")[0] === hoyStr
      );
      setLecturasHoy(lecturasDelDia.length);
      setTareasPendientes(tareasNotif);  
    })
    .catch(console.error)
    .finally(() => setLoading(false));
}, []);

  const medidoresOperativos = medidores.filter(
    (m) => m.estado === "Instalado"
  ).length;
  const medidoresConFalla = medidores.filter(
    (m) => m.estado === "Dañado" || m.estado === "En revisión"
  ).length;
  const medidoresMantenimiento = medidores.filter(
    (m) => m.estado === "Mantenimiento"
  ).length;

  const proximasTareas = medidores.slice(0, 3).map((m, i) => ({
    id: i,
    medidor: m,
    tipo: m.estado === "Mantenimiento" ? "Mantenimiento" : "Lectura",
    hora: ["09:00", "11:00", "14:00"][i] || "15:00",
    urgente: i === 0,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* ============ BIENVENIDA ============ */}
      <div
        className="rounded-2xl p-8 text-white shadow-md"
        style={{
          background: "linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-red-100 text-sm capitalize font-medium">
              {fechaFormateada}
            </p>
            <h1 className="text-3xl font-bold mt-1 text-white">
              {saludo}, {sesion?.nombre?.split(" ")[0] || "Técnico"} 
            </h1>
            <p className="text-red-100 text-sm mt-2">
              Tienes{" "}
              <strong className="text-white font-bold">
                {medidores.length} medidores
              </strong>{" "}
              asignados
              {medidoresConFalla > 0 && (
                <>
                  {" "}
                  y{" "}
                  <strong className="text-yellow-200 font-bold">
                    {medidoresConFalla} requieren atención
                  </strong>
                </>
              )}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/30">
            <p className="text-xs text-red-100 uppercase tracking-wide font-semibold">
              Lecturas Hoy
            </p>
            <p className="text-4xl font-bold text-white">{lecturasHoy}</p>
          </div>
        </div>
      </div>

      {/*  NOTIFICACIONES DE TAREAS ASIGNADAS */}
{tareasPendientes.length > 0 && (
  <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-5 shadow-sm">
    <div className="flex items-start gap-3">
      <div className="h-12 w-12 bg-yellow-400 text-white rounded-full flex items-center justify-center flex-shrink-0 relative">
        <i className="fa-solid fa-bell text-xl"></i>
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
          {tareasPendientes.length}
        </span>
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-yellow-800 text-lg mb-1">
          ¡Tienes {tareasPendientes.length} tarea{tareasPendientes.length !== 1 ? "s" : ""} nueva{tareasPendientes.length !== 1 ? "s" : ""}!
        </h3>
        <p className="text-sm text-yellow-700 mb-3">
          El administrador te asignó nuevas tareas. Revísalas en tu calendario.
        </p>

        {/* Lista de las primeras 3 */}
        <div className="space-y-2 mb-3">
          {tareasPendientes.slice(0, 3).map((t) => (
            <div
              key={t.id_tarea}
              className="bg-white rounded-lg p-3 border border-yellow-200 flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">
                  {t.titulo}
                </p>
                <p className="text-xs text-gray-500">
                   {t.fecha_programada} ·  {t.hora_programada?.substring(0, 5)}
                </p>
              </div>
              <span
                className={`text-[10px] px-2 py-1 rounded-full font-semibold flex-shrink-0 ${
                  t.prioridad === "Urgente"
                    ? "bg-red-100 text-red-700"
                    : t.prioridad === "Alta"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {t.prioridad}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/mi-calendario")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
        >
          <i className="fa-solid fa-calendar-days"></i>
          Ver todas mis tareas
        </button>
      </div>
    </div>
  </div>
)}

      {/* ============ KPIs ============ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-red-600 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Mis Medidores</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-1">
              {medidores.length}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Asignados a ti</p>
          </div>
          <div className="h-14 w-14 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-gauge-high text-2xl"></i>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Medidores Operativos
            </p>
            <h3 className="text-3xl font-bold text-gray-800 mt-1">
              {medidoresOperativos}
            </h3>
            <p className="text-xs text-green-600 mt-1">
              <i className="fa-solid fa-circle-check mr-1"></i>
              Funcionando bien
            </p>
          </div>
          <div className="h-14 w-14 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-circle-check text-2xl"></i>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-yellow-500 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Requieren Atención
            </p>
            <h3 className="text-3xl font-bold text-gray-800 mt-1">
              {medidoresConFalla + medidoresMantenimiento}
            </h3>
            <p className="text-xs text-yellow-600 mt-1">
              <i className="fa-solid fa-triangle-exclamation mr-1"></i>
              Falla o mantenimiento
            </p>
          </div>
          <div className="h-14 w-14 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
          </div>
        </div>
      </div>

      {/* ============ ACCESOS RÁPIDOS - MEJORADOS ============ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <i className="fa-solid fa-bolt text-red-600 mr-2"></i>
          Accesos Rápidos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Ver Mapa */}
          <button
            onClick={() => navigate("/mi-mapa")}
            className="p-5 rounded-xl border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 transition text-left group"
          >
            <div className="h-12 w-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-red-600 group-hover:text-white transition">
              <i className="fa-solid fa-map-location-dot text-xl"></i>
            </div>
            <h3 className="font-bold text-gray-800 mb-1 group-hover:text-red-700">
              Ver Mapa
            </h3>
            <p className="text-xs text-gray-500">
              Ubicación de mis medidores
            </p>
            <div className="mt-3 text-red-600 text-xs font-semibold opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
              Ir ahora <i className="fa-solid fa-arrow-right"></i>
            </div>
          </button>

          {/* Registrar Lectura */}
          <button
            onClick={() => navigate("/mis-medidores")}
            className="p-5 rounded-xl border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 transition text-left group"
          >
            <div className="h-12 w-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-red-600 group-hover:text-white transition">
              <i className="fa-solid fa-clipboard-list text-xl"></i>
            </div>
            <h3 className="font-bold text-gray-800 mb-1 group-hover:text-red-700">
              Registrar Lectura
            </h3>
            <p className="text-xs text-gray-500">
              Anotar consumo del medidor
            </p>
            <div className="mt-3 text-red-600 text-xs font-semibold opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
              Ir ahora <i className="fa-solid fa-arrow-right"></i>
            </div>
          </button>

          {/* Mi Calendario */}
          <button
            onClick={() => navigate("/mi-calendario")}
            className="p-5 rounded-xl border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 transition text-left group"
          >
            <div className="h-12 w-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-red-600 group-hover:text-white transition">
              <i className="fa-solid fa-calendar-days text-xl"></i>
            </div>
            <h3 className="font-bold text-gray-800 mb-1 group-hover:text-red-700">
              Mi Calendario
            </h3>
            <p className="text-xs text-gray-500">
              Ver mis tareas programadas
            </p>
            <div className="mt-3 text-red-600 text-xs font-semibold opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
              Ir ahora <i className="fa-solid fa-arrow-right"></i>
            </div>
          </button>

          {/* Ayuda */}
          <button
            onClick={() => navigate("/about")}
            className="p-5 rounded-xl border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 transition text-left group"
          >
            <div className="h-12 w-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-red-600 group-hover:text-white transition">
              <i className="fa-solid fa-circle-info text-xl"></i>
            </div>
            <h3 className="font-bold text-gray-800 mb-1 group-hover:text-red-700">
              Ayuda
            </h3>
            <p className="text-xs text-gray-500">
              Información del sistema
            </p>
            <div className="mt-3 text-red-600 text-xs font-semibold opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
              Ir ahora <i className="fa-solid fa-arrow-right"></i>
            </div>
          </button>
        </div>
      </div>

      {/* ============ PRÓXIMAS TAREAS ============ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 flex items-center">
            <i className="fa-solid fa-list-check text-red-600 mr-2"></i>
            Próximas Tareas
          </h3>
          <Link
            to="/mi-calendario"
            className="text-red-600 hover:text-red-800 text-xs font-semibold"
          >
            Ver todas <i className="fa-solid fa-arrow-right ml-1"></i>
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <i className="fa-solid fa-spinner fa-spin mr-2"></i>
            Cargando tareas...
          </div>
        ) : proximasTareas.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <i className="fa-solid fa-calendar-check text-4xl mb-2"></i>
            <p>No tienes tareas pendientes</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {proximasTareas.map((t) => (
              <div
                key={t.id}
                className="p-4 hover:bg-red-50/40 transition cursor-pointer flex items-center gap-4"
                onClick={() => navigate("/mi-calendario")}
              >
                <div
                  className={`h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    t.tipo === "Mantenimiento"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  <i
                    className={`fa-solid ${
                      t.tipo === "Mantenimiento"
                        ? "fa-wrench"
                        : "fa-clipboard-list"
                    }`}
                  ></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">
                    {t.tipo} - {t.medidor.codigo_medidor}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                     {t.medidor.cliente_nombre} ·  {t.medidor.direccion}
                  </p>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ${
                    t.urgente
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <i className="fa-regular fa-clock mr-1"></i>
                  {t.urgente ? "Hoy" : "Mañana"} {t.hora}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============ ESTADO DEL SISTEMA ============ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center">
          <i className="fa-solid fa-signal text-red-600 mr-2"></i>
          Estado del Sistema
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
            <div>
              <p className="text-sm font-semibold text-green-800">Servidor</p>
              <p className="text-xs text-green-600">Conectado</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
            <div>
              <p className="text-sm font-semibold text-green-800">GPS</p>
              <p className="text-xs text-green-600">Activo</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
            <div>
              <p className="text-sm font-semibold text-green-800">
                Última sincronización
              </p>
              <p className="text-xs text-green-600">Hace 2 minutos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiPanel;