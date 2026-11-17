import { useEffect, useState } from "react";
import { tareaService, type Tarea } from "../services/tareaService";

const MiCalendario: React.FC = () => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState("Todas");
  const [toast, setToast] = useState<{ tipo: "exito" | "error"; mensaje: string } | null>(null);

  const mostrarToast = (tipo: "exito" | "error", mensaje: string) => {
    setToast({ tipo, mensaje });
    setTimeout(() => setToast(null), 4000);
  };

  //  Cargar tareas del técnico
  const cargarTareas = async () => {
    try {
      setLoading(true);
      const data = await tareaService.getMisNotificaciones();
      // Traer TODAS las tareas del técnico (no solo las no leídas)
      const todas = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/tareas`,
        {
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("usuario") || "{}").token
            }`,
          },
        }
      ).then((r) => r.json());

      // Filtrar solo las del técnico logueado
      const idUsuario = JSON.parse(localStorage.getItem("usuario") || "{}").id_usuario;
      
      // Buscar el id_tecnico del usuario
      const tecnicos = await fetch(
        `http://localhost:4000/api/tecnicos`,
      ).then((r) => r.json());

      // Por ahora usamos las notificaciones (ya vienen filtradas por técnico)
      setTareas(data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Error al cargar tus tareas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTareas();
  }, []);

  //  Cambiar estado de tarea
  const cambiarEstado = async (id: number, nuevoEstado: string) => {
    try {
      await tareaService.cambiarEstado(id, nuevoEstado);
      mostrarToast("exito", ` Tarea marcada como "${nuevoEstado}"`);
      await cargarTareas();
    } catch (err: any) {
      mostrarToast("error", ` ${err.response?.data?.error || "Error"}`);
    }
  };

  //  Marcar notificación como leída
  const marcarLeida = async (id: number) => {
    try {
      await tareaService.marcarLeida(id);
      await cargarTareas();
    } catch (err) {
      console.error(err);
    }
  };

  const tareasFiltradas =
    filtroEstado === "Todas"
      ? tareas
      : tareas.filter((t) => t.estado === filtroEstado);

  const coloresEstado: Record<string, string> = {
    Pendiente: "border-yellow-500 bg-yellow-50",
    "En progreso": "border-blue-500 bg-blue-50",
    Completada: "border-green-500 bg-green-50",
    Cancelada: "border-gray-400 bg-gray-50",
  };

  const estados = ["Todas", "Pendiente", "En progreso", "Completada"];

  if (loading) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
        Cargando tus tareas...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] border rounded-xl px-5 py-4 shadow-lg flex items-center gap-3 min-w-[320px] ${
            toast.tipo === "exito"
              ? "bg-green-50 border-green-300 text-green-800"
              : "bg-red-50 border-red-300 text-red-800"
          }`}
        >
          <i
            className={`fa-solid ${
              toast.tipo === "exito" ? "fa-circle-check" : "fa-circle-exclamation"
            } text-xl`}
          ></i>
          <span className="flex-1 text-sm font-medium">{toast.mensaje}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-red-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <i className="fa-solid fa-calendar-days mr-2"></i>
              Mi Calendario de Tareas
            </h1>
            <p className="text-red-100 text-sm mt-1">
              Tareas asignadas por el administrador
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-red-100 uppercase">Total Asignadas</p>
            <p className="text-3xl font-bold text-white">{tareas.length}</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-gray-600 font-medium mr-2">
            <i className="fa-solid fa-filter mr-1 text-red-600"></i>
            Filtrar:
          </label>
          {estados.map((e) => (
            <button
              key={e}
              onClick={() => setFiltroEstado(e)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filtroEstado === e
                  ? "bg-red-600 text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-red-50"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de tareas */}
      {tareasFiltradas.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <i className="fa-solid fa-calendar-check text-5xl text-gray-300 mb-3"></i>
          <p className="font-semibold text-gray-500">
            {tareas.length === 0
              ? "No tienes tareas asignadas"
              : "No hay tareas con este filtro"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {tareas.length === 0
              ? "El administrador te asignará tareas pronto"
              : "Prueba con otro filtro"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tareasFiltradas.map((t) => (
            <div
              key={t.id_tarea}
              className={`bg-white rounded-xl border-l-4 ${
                coloresEstado[t.estado] || "border-gray-300"
              } p-5 shadow-sm hover:shadow-md transition`}
            >
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="text-center flex-shrink-0 bg-white rounded-lg border border-gray-200 p-3 min-w-[80px]">
                    <p className="text-xs text-gray-500 font-medium">
                      {t.fecha_programada}
                    </p>
                    <p className="text-xl font-bold text-gray-800">
                      {t.hora_programada?.substring(0, 5)}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-gray-800">{t.titulo}</p>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
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
                    <p className="text-sm text-gray-600 mb-1">
                      <i className="fa-solid fa-tag mr-1 text-red-600"></i>
                      {t.tipo}
                      {t.codigo_medidor && ` - ${t.codigo_medidor}`}
                    </p>
                    {t.descripcion && (
                      <p className="text-xs text-gray-500 italic mb-2">
                        "{t.descripcion}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      t.estado === "Pendiente"
                        ? "bg-yellow-100 text-yellow-700"
                        : t.estado === "En progreso"
                        ? "bg-blue-100 text-blue-700"
                        : t.estado === "Completada"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {t.estado}
                  </span>

                  {/* Acciones */}
                  <div className="flex gap-1">
                    {t.estado === "Pendiente" && (
                      <button
                        onClick={() => {
                          cambiarEstado(t.id_tarea, "En progreso");
                          marcarLeida(t.id_tarea);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition"
                        title="Iniciar tarea"
                      >
                        <i className="fa-solid fa-play"></i>
                      </button>
                    )}
                    {t.estado === "En progreso" && (
                      <button
                        onClick={() => cambiarEstado(t.id_tarea, "Completada")}
                        className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition"
                        title="Marcar completada"
                      >
                        <i className="fa-solid fa-check"></i>
                      </button>
                    )}
                    {t.estado === "Completada" && (
                      <span className="text-green-600 p-2" title="Completada">
                        <i className="fa-solid fa-circle-check text-lg"></i>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MiCalendario;