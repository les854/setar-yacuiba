import { useEffect, useState } from "react";
import { tareaService, type Tarea } from "../services/tareaService";
import { tecnicoService } from "../services/tecnicoService";
import { medidorService } from "../services/medidorService";
import type { Tecnico } from "../types/tecnico";
import type { Medidor } from "../types/medidor";

const Calendario: React.FC = () => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [medidores, setMedidores] = useState<Medidor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTecnico, setFiltroTecnico] = useState<string>("todos");
  const [filtroEstado, setFiltroEstado] = useState<string>("todas");
  const [filtroFecha, setFiltroFecha] = useState<string>("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState<{ tipo: "exito" | "error"; mensaje: string } | null>(null);

  const [form, setForm] = useState<Partial<Tarea>>({
    id_tecnico: 0,
    id_medidor: undefined,
    titulo: "",
    descripcion: "",
    tipo: "Lectura",
    fecha_programada: new Date().toISOString().split("T")[0],
    hora_programada: "09:00",
    prioridad: "Normal",
  });

  const mostrarToast = (tipo: "exito" | "error", mensaje: string) => {
    setToast({ tipo, mensaje });
    setTimeout(() => setToast(null), 4000);
  };

  //  Cargar datos
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [tareasData, tecnicosData, medidoresData] = await Promise.all([
        tareaService.getAll(),
        tecnicoService.getAll(),
        medidorService.getAll(),
      ]);
      setTareas(tareasData);
      setTecnicos(tecnicosData);
      setMedidores(medidoresData);
    } catch (err) {
      console.error(err);
      mostrarToast("error", "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  //  Filtros
  const tareasFiltradas = tareas.filter((t) => {
    const coincideTecnico = filtroTecnico === "todos" || String(t.id_tecnico) === filtroTecnico;
    const coincideEstado = filtroEstado === "todas" || t.estado === filtroEstado;
    const coincideFecha = !filtroFecha || t.fecha_programada === filtroFecha;
    return coincideTecnico && coincideEstado && coincideFecha;
  });

  //  Estadísticas
  const stats = {
    total: tareas.length,
    pendientes: tareas.filter((t) => t.estado === "Pendiente").length,
    enProgreso: tareas.filter((t) => t.estado === "En progreso").length,
    completadas: tareas.filter((t) => t.estado === "Completada").length,
  };

  //  Guardar tarea
  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.id_tecnico || form.id_tecnico === 0) {
      mostrarToast("error", "Selecciona un técnico");
      return;
    }

    setGuardando(true);
    try {
      const sesionStr = localStorage.getItem("usuario");
      const sesion = sesionStr ? JSON.parse(sesionStr) : null;
      const idUsuario = sesion?.id_usuario || sesion?.id;

      await tareaService.create({
        ...form,
        id_usuario_creador: idUsuario,
      } as any);

      mostrarToast("exito", ` Tarea asignada al técnico`);
      setModalAbierto(false);
      setForm({
        id_tecnico: 0,
        id_medidor: undefined,
        titulo: "",
        descripcion: "",
        tipo: "Lectura",
        fecha_programada: new Date().toISOString().split("T")[0],
        hora_programada: "09:00",
        prioridad: "Normal",
      });
      await cargarDatos();
    } catch (err: any) {
      console.error(err);
      mostrarToast("error", ` ${err.response?.data?.error || "Error al guardar"}`);
    } finally {
      setGuardando(false);
    }
  };

  //  Eliminar tarea
  const eliminarTarea = async (id: number) => {
    if (!confirm("¿Eliminar esta tarea?")) return;
    try {
      await tareaService.delete(id);
      mostrarToast("exito", " Tarea eliminada");
      await cargarDatos();
    } catch (err) {
      mostrarToast("error", " Error al eliminar");
    }
  };

  //  Formatear fecha
  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha + "T12:00:00");
    const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}`;
  };

  const colorEstado = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return "border-yellow-500 bg-yellow-50";
      case "En progreso":
        return "border-blue-500 bg-blue-50";
      case "Completada":
        return "border-green-500 bg-green-50";
      case "Cancelada":
        return "border-gray-400 bg-gray-50";
      default:
        return "border-gray-300 bg-white";
    }
  };

  const colorPrioridad = (p: string) => {
    switch (p) {
      case "Urgente":
        return "bg-red-100 text-red-700";
      case "Alta":
        return "bg-orange-100 text-orange-700";
      case "Normal":
        return "bg-blue-100 text-blue-700";
      case "Baja":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
        Cargando calendario...
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
              Calendario de Tareas - Todos los Técnicos
            </h1>
            <p className="text-red-100 text-sm mt-1">
              Asigna tareas a los técnicos y ellos recibirán una notificación
            </p>
          </div>
          <button
            onClick={() => setModalAbierto(true)}
            className="bg-white text-red-700 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-red-50 transition flex items-center gap-2 shadow-lg"
          >
            <i className="fa-solid fa-plus-circle"></i>
            Nueva Tarea
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-600">
          <p className="text-xs text-gray-500 uppercase">Total</p>
          <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-yellow-500">
          <p className="text-xs text-gray-500 uppercase">Pendientes</p>
          <h3 className="text-2xl font-bold text-yellow-600">{stats.pendientes}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-xs text-gray-500 uppercase">En progreso</p>
          <h3 className="text-2xl font-bold text-blue-600">{stats.enProgreso}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
          <p className="text-xs text-gray-500 uppercase">Completadas</p>
          <h3 className="text-2xl font-bold text-green-600">{stats.completadas}</h3>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium">
              <i className="fa-solid fa-user-hard-hat mr-1 text-red-600"></i>
              Técnico:
            </label>
            <select
              value={filtroTecnico}
              onChange={(e) => setFiltroTecnico(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="todos">Todos los técnicos</option>
              {tecnicos.map((t) => (
                <option key={t.id_tecnico} value={t.id_tecnico}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium">Estado:</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="todas">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En progreso">En progreso</option>
              <option value="Completada">Completada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium">Fecha:</label>
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {filtroFecha && (
              <button
                onClick={() => setFiltroFecha("")}
                className="text-xs text-red-600 hover:text-red-800 font-semibold"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          <span className="ml-auto text-sm text-gray-500">
            {tareasFiltradas.length} tarea{tareasFiltradas.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Lista de tareas */}
      {tareasFiltradas.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <i className="fa-solid fa-calendar-xmark text-5xl text-gray-300 mb-3"></i>
          <p className="font-semibold text-gray-500">No hay tareas asignadas</p>
          <p className="text-xs text-gray-400 mt-1">
            Crea una tarea con el botón "Nueva Tarea"
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tareasFiltradas.map((t) => (
            <div
              key={t.id_tarea}
              className={`bg-white rounded-xl border-l-4 ${colorEstado(t.estado)} p-5 shadow-sm hover:shadow-md transition`}
            >
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Fecha y hora */}
                  <div className="text-center flex-shrink-0 bg-white rounded-lg border border-gray-200 p-3 min-w-[80px]">
                    <p className="text-xs text-gray-500 font-medium">
                      {formatearFecha(t.fecha_programada)}
                    </p>
                    <p className="text-xl font-bold text-gray-800">
                      {t.hora_programada?.substring(0, 5)}
                    </p>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-gray-800">{t.titulo}</p>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${colorPrioridad(t.prioridad)}`}>
                        {t.prioridad}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {t.tipo}
                      {t.codigo_medidor && ` - ${t.codigo_medidor}`}
                    </p>
                    {t.descripcion && (
                      <p className="text-xs text-gray-500 mb-2 italic">
                        "{t.descripcion}"
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>
                        <i className="fa-solid fa-user-hard-hat mr-1 text-red-600"></i>
                        {t.tecnico_nombre || "Sin asignar"}
                      </span>
                      {t.medidor_direccion && (
                        <span>
                          <i className="fa-solid fa-location-dot mr-1 text-red-600"></i>
                          {t.medidor_direccion}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Estado y acciones */}
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
                  <button
                    onClick={() => eliminarTarea(t.id_tarea)}
                    className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50"
                    title="Eliminar tarea"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL NUEVA TAREA */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-100 bg-red-50 rounded-t-2xl">
              <h2 className="text-lg font-bold text-red-700 flex items-center">
                <i className="fa-solid fa-plus-circle mr-2"></i>
                Asignar Nueva Tarea
              </h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-gray-400 hover:text-red-600 text-xl"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={guardar} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título de la tarea *
                </label>
                <input
                  type="text"
                  required
                  value={form.titulo || ""}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Ej: Lectura mensual MED-0045"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Técnico asignado *
                  </label>
                  <select
                    required
                    value={form.id_tecnico || 0}
                    onChange={(e) => setForm({ ...form, id_tecnico: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value={0}>Seleccionar técnico...</option>
                    {tecnicos.map((t) => (
                      <option key={t.id_tecnico} value={t.id_tecnico}>
                        {t.nombre} - {t.especialidad}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de tarea *
                  </label>
                  <select
                    required
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Lectura">Lectura</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Instalación">Instalación</option>
                    <option value="Reconexión">Reconexión</option>
                    <option value="Corte">Corte</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medidor relacionado (opcional)
                </label>
                <select
                  value={form.id_medidor || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      id_medidor: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Sin medidor específico</option>
                  {medidores.slice(0, 50).map((m) => (
                    <option key={m.id_medidor} value={m.id_medidor}>
                      {m.codigo_medidor} - {m.direccion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.fecha_programada || ""}
                    onChange={(e) =>
                      setForm({ ...form, fecha_programada: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora *
                  </label>
                  <input
                    type="time"
                    required
                    value={form.hora_programada || ""}
                    onChange={(e) =>
                      setForm({ ...form, hora_programada: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridad
                </label>
                <select
                  value={form.prioridad || "Normal"}
                  onChange={(e) => setForm({ ...form, prioridad: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Baja">Baja</option>
                  <option value="Normal">Normal</option>
                  <option value="Alta">Alta</option>
                  <option value="Urgente">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción / Instrucciones
                </label>
                <textarea
                  rows={3}
                  value={form.descripcion || ""}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Instrucciones específicas para el técnico..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                <i className="fa-solid fa-info-circle mr-1"></i>
                El técnico recibirá una <strong>notificación</strong> en su panel
                cuando asignes esta tarea.
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {guardando ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i>
                      Asignar Tarea
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendario;