import { useState } from "react";
import { useTecnicos } from "../hooks/useTecnico";
import { tecnicoService } from "../services/tecnicoService";
import type { Tecnico } from "../types/tecnico";

const Tecnicos: React.FC = () => {
  const { tecnicos, loading, error, refetch } = useTecnicos();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Tecnico | null>(null);
  const [filtro, setFiltro] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState<{ tipo: "exito" | "error"; mensaje: string } | null>(null);
  const [modalEliminar, setModalEliminar] = useState<Tecnico | null>(null);

  const [form, setForm] = useState<Partial<Tecnico>>({
    id_usuario: 1,
    nombre: "",
    telefono: "",
    especialidad: "Instalacion",
    estado: true,
  });

  const mostrarToast = (tipo: "exito" | "error", mensaje: string) => {
    setToast({ tipo, mensaje });
    setTimeout(() => setToast(null), 4000);
  };

  // ============================================
  // CREAR / EDITAR
  // ============================================
  const abrirCrear = () => {
    setEditando(null);
    setForm({
      id_usuario: 1,
      nombre: "",
      telefono: "",
      especialidad: "Instalacion",
      estado: true,
    });
    setModalAbierto(true);
  };

  const abrirEditar = (t: Tecnico) => {
    setEditando(t);
    setForm({
      ...t,
      id_usuario: Number(t.id_usuario),
    });
    setModalAbierto(true);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (editando) {
        await tecnicoService.update(editando.id_tecnico, form);
        mostrarToast("exito", ` Técnico ${form.nombre} actualizado`);
      } else {
        await tecnicoService.create(form as Omit<Tecnico, "id_tecnico">);
        mostrarToast("exito", ` Técnico ${form.nombre} creado`);
      }
      setModalAbierto(false);
      await refetch();
    } catch (err: any) {
      console.error(err);
      mostrarToast("error", ` ${err.response?.data?.error || "Error al guardar"}`);
    } finally {
      setGuardando(false);
    }
  };

  // ============================================
  //  OPCIONES DE ELIMINACIÓN
  // ============================================
  const abrirOpcionesEliminar = (t: Tecnico) => {
    setModalEliminar(t);
  };

  const desactivarTecnico = async () => {
    if (!modalEliminar) return;
    try {
      await tecnicoService.desactivar(modalEliminar.id_tecnico);
      mostrarToast("exito", ` Técnico ${modalEliminar.nombre} desactivado`);
      setModalEliminar(null);
      await refetch();
    } catch (err: any) {
      mostrarToast("error", ` ${err.response?.data?.error || "Error al desactivar"}`);
    }
  };

  const reactivarTecnico = async () => {
    if (!modalEliminar) return;
    try {
      await tecnicoService.reactivar(modalEliminar.id_tecnico);
      mostrarToast("exito", ` Técnico ${modalEliminar.nombre} reactivado`);
      setModalEliminar(null);
      await refetch();
    } catch (err: any) {
      mostrarToast("error", ` ${err.response?.data?.error || "Error al reactivar"}`);
    }
  };

  const eliminarDefinitivo = async () => {
    if (!modalEliminar) return;
    const confirmar = confirm(
      ` ¿ELIMINAR DEFINITIVAMENTE al técnico "${modalEliminar.nombre}"?\n\nEsta acción NO se puede deshacer.`
    );
    if (!confirmar) return;

    try {
      await tecnicoService.eliminarDefinitivo(modalEliminar.id_tecnico);
      mostrarToast("exito", ` Técnico ${modalEliminar.nombre} eliminado definitivamente`);
      setModalEliminar(null);
      await refetch();
    } catch (err: any) {
      mostrarToast("error", ` ${err.response?.data?.error || "Error al eliminar"}`);
    }
  };

  // ============================================
  // FILTRO
  // ============================================
  const tecnicosFiltrados = tecnicos.filter(
    (t) =>
      t.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
      t.especialidad?.toLowerCase().includes(filtro.toLowerCase()) ||
      t.telefono?.toLowerCase().includes(filtro.toLowerCase())
  );

  // ============================================
  // COLORES POR ESPECIALIDAD
  // ============================================
  const colorEspecialidad = (esp: string) => {
    switch (esp) {
      case "Instalacion":
        return "bg-blue-100 text-blue-700";
      case "Mantenimiento":
        return "bg-yellow-100 text-yellow-700";
      case "Reconexion":
        return "bg-green-100 text-green-700";
      case "Corte":
        return "bg-red-100 text-red-700";
      case "Lectura":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ============================================
  // ESTADOS DE CARGA Y ERROR
  // ============================================
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <i className="fa-solid fa-spinner fa-spin text-red-600 text-3xl mr-3"></i>
        <span className="text-red-600 font-semibold">Cargando técnicos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-300 text-red-700 rounded-xl p-4 flex items-center">
          <i className="fa-solid fa-circle-exclamation mr-2"></i>
          {error}
          <button onClick={refetch} className="ml-4 underline font-semibold">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
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
          <i className={`fa-solid ${toast.tipo === "exito" ? "fa-circle-check" : "fa-circle-exclamation"} text-xl`}></i>
          <span className="flex-1 text-sm font-medium">{toast.mensaje}</span>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-700">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Técnicos</h1>
          <p className="text-sm text-gray-500 mt-1">
            {tecnicosFiltrados.length} de {tecnicos.length} técnicos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre, especialidad..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={abrirCrear}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition flex items-center"
          >
            <i className="fa-solid fa-plus mr-2"></i>
            Nuevo Técnico
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr className="text-gray-500 text-xs uppercase">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Nombre</th>
                <th className="py-3 px-4">Teléfono</th>
                <th className="py-3 px-4">Especialidad</th>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
              {tecnicosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <i className="fa-solid fa-inbox text-4xl mb-2 block"></i>
                    No hay técnicos para mostrar
                  </td>
                </tr>
              ) : (
                tecnicosFiltrados.map((t) => (
                  <tr key={t.id_tecnico} className="hover:bg-red-50/40">
                    <td className="py-3 px-4 font-mono text-xs text-gray-400">
                      {String(t.id_tecnico).padStart(3, "0")}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-xs mr-3">
                          {t.nombre?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span className="font-medium">{t.nombre}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{t.telefono}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colorEspecialidad(
                          t.especialidad
                        )}`}
                      >
                        {t.especialidad}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-500">
                      {t.usuario || "-"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          t.estado
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {t.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => abrirEditar(t)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg mr-1 hover:bg-blue-50 transition"
                        title="Editar"
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button
                        onClick={() => abrirOpcionesEliminar(t)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition"
                        title="Opciones de eliminación"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================
          MODAL CREAR / EDITAR
      ============================================ */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-100 bg-red-50 rounded-t-2xl">
              <h2 className="text-lg font-bold text-red-700 flex items-center">
                <i className={`fa-solid ${editando ? "fa-pen" : "fa-plus-circle"} mr-2`}></i>
                {editando ? "Editar Técnico" : "Registrar Nuevo Técnico"}
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
                  Nombre completo *
                </label>
                <input
                  type="text"
                  required
                  value={form.nombre || ""}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Ej: Pedro Mamani Condori"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.telefono || ""}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="70012345"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Usuario
                  </label>
                  <input
                    type="number"
                    value={form.id_usuario || 1}
                    onChange={(e) => setForm({ ...form, id_usuario: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especialidad *
                </label>
                <select
                  value={form.especialidad || "Instalacion"}
                  onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option>Instalacion</option>
                  <option>Mantenimiento</option>
                  <option>Reconexion</option>
                  <option>Corte</option>
                  <option>Lectura</option>
                </select>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="estado"
                  checked={form.estado ?? true}
                  onChange={(e) => setForm({ ...form, estado: e.target.checked })}
                  className="w-4 h-4 accent-red-600"
                />
                <label htmlFor="estado" className="text-sm text-gray-700 cursor-pointer">
                  Técnico activo (disponible para asignación)
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50 flex items-center"
                >
                  {guardando ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-save mr-2"></i>
                      {editando ? "Actualizar" : "Guardar"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================
          MODAL DE OPCIONES DE ELIMINACIÓN
      ============================================ */}
      {modalEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-100 bg-red-50 rounded-t-2xl">
              <h2 className="text-lg font-bold text-red-700 flex items-center">
                <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                Opciones para el técnico
              </h2>
              <button
                onClick={() => setModalEliminar(null)}
                className="text-gray-400 hover:text-red-600 text-xl"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Info del técnico */}
              <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                <div className="h-12 w-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-lg mr-3">
                  {modalEliminar.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{modalEliminar.nombre}</p>
                  <p className="text-xs text-gray-500">{modalEliminar.especialidad}</p>
                  <p className="text-xs text-gray-500">
                    Estado actual:{" "}
                    <span
                      className={
                        modalEliminar.estado
                          ? "text-green-600 font-semibold"
                          : "text-gray-500 font-semibold"
                      }
                    >
                      {modalEliminar.estado ? "Activo" : "Inactivo"}
                    </span>
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 font-medium">
                ¿Qué deseas hacer con este técnico?
              </p>

              {/* Opción 1: Desactivar / Reactivar */}
              {modalEliminar.estado ? (
                <button
                  onClick={desactivarTecnico}
                  className="w-full flex items-center p-4 rounded-lg border-2 border-yellow-200 bg-yellow-50 hover:bg-yellow-100 transition text-left"
                >
                  <div className="h-10 w-10 bg-yellow-200 text-yellow-700 rounded-lg flex items-center justify-center mr-3">
                    <i className="fa-solid fa-ban text-lg"></i>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-yellow-800">Desactivar técnico</p>
                    <p className="text-xs text-yellow-700">
                      Queda inactivo pero conserva su historial
                    </p>
                  </div>
                  <i className="fa-solid fa-chevron-right text-yellow-600"></i>
                </button>
              ) : (
                <button
                  onClick={reactivarTecnico}
                  className="w-full flex items-center p-4 rounded-lg border-2 border-green-200 bg-green-50 hover:bg-green-100 transition text-left"
                >
                  <div className="h-10 w-10 bg-green-200 text-green-700 rounded-lg flex items-center justify-center mr-3">
                    <i className="fa-solid fa-check text-lg"></i>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-green-800">Reactivar técnico</p>
                    <p className="text-xs text-green-700">
                      Vuelve a estar disponible para asignaciones
                    </p>
                  </div>
                  <i className="fa-solid fa-chevron-right text-green-600"></i>
                </button>
              )}

              {/* Opción 2: Eliminar definitivamente */}
              <button
                onClick={eliminarDefinitivo}
                className="w-full flex items-center p-4 rounded-lg border-2 border-red-200 bg-red-50 hover:bg-red-100 transition text-left"
              >
                <div className="h-10 w-10 bg-red-200 text-red-700 rounded-lg flex items-center justify-center mr-3">
                  <i className="fa-solid fa-trash text-lg"></i>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-red-800">Eliminar definitivamente</p>
                  <p className="text-xs text-red-700">
                    Borra el técnico de la base de datos.{" "}
                    <strong>No se puede deshacer.</strong>
                  </p>
                </div>
                <i className="fa-solid fa-chevron-right text-red-600"></i>
              </button>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl text-center">
              <button
                onClick={() => setModalEliminar(null)}
                className="text-sm text-gray-500 hover:text-gray-700 font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tecnicos;