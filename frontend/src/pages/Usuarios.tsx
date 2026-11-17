import { useEffect, useState } from "react";
import { usuarioService } from "../services/usuarioService";
import type { Usuario } from "../types/usuario";

const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState("");

  // Modal crear/editar
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Modal opciones eliminar
  const [modalEliminar, setModalEliminar] = useState<Usuario | null>(null);

  const [toast, setToast] = useState<{ tipo: "exito" | "error"; mensaje: string } | null>(null);

  const [form, setForm] = useState<Partial<Usuario>>({
    nombre: "",
    usuario: "",
    password: "",
    rol: "Cliente",
    estado: true,
  });

  const mostrarToast = (tipo: "exito" | "error", mensaje: string) => {
    setToast({ tipo, mensaje });
    setTimeout(() => setToast(null), 4000);
  };

  //  Cargar usuarios
  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await usuarioService.getAll();
      setUsuarios(data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  //  Abrir crear
  const abrirCrear = () => {
    setEditando(null);
    setForm({
      nombre: "",
      usuario: "",
      password: "",
      rol: "Cliente",
      estado: true,
    });
    setModalAbierto(true);
  };

  //  Abrir editar
  const abrirEditar = (u: Usuario) => {
    setEditando(u);
    setForm({
      nombre: u.nombre,
      usuario: u.usuario,
      rol: u.rol,
      estado: u.estado,
    });
    setModalAbierto(true);
  };

  //  Guardar
  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (editando) {
        await usuarioService.update(editando.id_usuario, form);
        mostrarToast("exito", ` Usuario ${form.nombre} actualizado`);
      } else {
        await usuarioService.create(form as Omit<Usuario, "id_usuario">);
        mostrarToast("exito", ` Usuario ${form.nombre} creado`);
      }
      setModalAbierto(false);
      await cargarUsuarios();
    } catch (err: any) {
      mostrarToast("error", ` ${err.response?.data?.error || "Error al guardar"}`);
    } finally {
      setGuardando(false);
    }
  };

  //  Opciones eliminar
  const desactivarUsuario = async () => {
    if (!modalEliminar) return;
    try {
      await usuarioService.desactivar(modalEliminar.id_usuario);
      mostrarToast("exito", ` Usuario ${modalEliminar.nombre} desactivado`);
      setModalEliminar(null);
      await cargarUsuarios();
    } catch (err: any) {
      mostrarToast("error", ` ${err.response?.data?.error || "Error"}`);
    }
  };

  const reactivarUsuario = async () => {
    if (!modalEliminar) return;
    try {
      await usuarioService.reactivar(modalEliminar.id_usuario);
      mostrarToast("exito", ` Usuario ${modalEliminar.nombre} reactivado`);
      setModalEliminar(null);
      await cargarUsuarios();
    } catch (err: any) {
      mostrarToast("error", ` ${err.response?.data?.error || "Error"}`);
    }
  };

  const eliminarDefinitivo = async () => {
    if (!modalEliminar) return;
    const confirmar = confirm(
      `⚠️ ¿ELIMINAR DEFINITIVAMENTE a "${modalEliminar.nombre}"?\n\nEsta acción NO se puede deshacer.`
    );
    if (!confirmar) return;
    try {
      await usuarioService.eliminarDefinitivo(modalEliminar.id_usuario);
      mostrarToast("exito", ` Usuario ${modalEliminar.nombre} eliminado`);
      setModalEliminar(null);
      await cargarUsuarios();
    } catch (err: any) {
      mostrarToast("error", ` ${err.response?.data?.error || "Error"}`);
    }
  };

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
      u.usuario?.toLowerCase().includes(filtro.toLowerCase()) ||
      u.rol?.toLowerCase().includes(filtro.toLowerCase())
  );

  const colorRol = (rol: string) => {
    switch (rol) {
      case "Administrador":
        return "bg-red-100 text-red-700";
      case "Tecnico":
        return "bg-yellow-100 text-yellow-700";
      case "Usuario":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
        Cargando usuarios...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-300 text-red-700 rounded-xl p-4">
          {error}
        </div>
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
          <p className="text-sm text-gray-500 mt-1">
            {usuariosFiltrados.length} de {usuarios.length} usuarios
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre, usuario o rol..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={abrirCrear}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition flex items-center"
          >
            <i className="fa-solid fa-plus mr-2"></i>
            Nuevo Usuario
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
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Rol</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Registro</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
              {usuariosFiltrados.map((u) => (
                <tr key={u.id_usuario} className="hover:bg-red-50/40">
                  <td className="py-3 px-4 font-mono text-xs text-gray-400">
                    {String(u.id_usuario).padStart(3, "0")}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-xs mr-3">
                        {u.nombre?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <span className="font-medium">{u.nombre}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">{u.usuario}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colorRol(u.rol)}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.estado
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {u.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">
                    {u.fecha_registro
                      ? new Date(u.fecha_registro).toLocaleDateString("es-BO")
                      : "-"}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => abrirEditar(u)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-lg mr-1 hover:bg-blue-50 transition"
                      title="Editar"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button
                      onClick={() => setModalEliminar(u)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition"
                      title="Opciones"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREAR/EDITAR */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-100 bg-red-50 rounded-t-2xl">
              <h2 className="text-lg font-bold text-red-700">
                <i className={`fa-solid ${editando ? "fa-pen" : "fa-user-plus"} mr-2`}></i>
                {editando ? "Editar Usuario" : "Nuevo Usuario"}
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
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario *
                </label>
                <input
                  type="text"
                  required
                  value={form.usuario || ""}
                  onChange={(e) => setForm({ ...form, usuario: e.target.value })}
                  disabled={!!editando}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                  placeholder="user0051"
                />
              </div>

              {!editando && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.password || ""}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="HASH_0051"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol *
                </label>
                <select
                  value={form.rol || "Usuario"}
                  onChange={(e) => setForm({ ...form, rol: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Tecnico">Técnico</option>
                  <option value="Usuario">Usuario</option>
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
                  Usuario activo (puede iniciar sesión)
                </label>
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
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {guardando ? "Guardando..." : editando ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL OPCIONES ELIMINAR */}
      {modalEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-100 bg-red-50 rounded-t-2xl">
              <h2 className="text-lg font-bold text-red-700">
                <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                Opciones
              </h2>
              <button
                onClick={() => setModalEliminar(null)}
                className="text-gray-400 hover:text-red-600 text-xl"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                <div className="h-12 w-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-lg mr-3">
                  {modalEliminar.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{modalEliminar.nombre}</p>
                  <p className="text-xs text-gray-500 font-mono">{modalEliminar.usuario}</p>
                  <p className="text-xs text-gray-500">
                    Rol: <strong>{modalEliminar.rol}</strong>
                  </p>
                </div>
              </div>

              {modalEliminar.estado ? (
                <button
                  onClick={desactivarUsuario}
                  className="w-full flex items-center p-4 rounded-lg border-2 border-yellow-200 bg-yellow-50 hover:bg-yellow-100 transition text-left"
                >
                  <div className="h-10 w-10 bg-yellow-200 text-yellow-700 rounded-lg flex items-center justify-center mr-3">
                    <i className="fa-solid fa-ban text-lg"></i>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-yellow-800">Desactivar usuario</p>
                    <p className="text-xs text-yellow-700">No podrá iniciar sesión</p>
                  </div>
                  <i className="fa-solid fa-chevron-right text-yellow-600"></i>
                </button>
              ) : (
                <button
                  onClick={reactivarUsuario}
                  className="w-full flex items-center p-4 rounded-lg border-2 border-green-200 bg-green-50 hover:bg-green-100 transition text-left"
                >
                  <div className="h-10 w-10 bg-green-200 text-green-700 rounded-lg flex items-center justify-center mr-3">
                    <i className="fa-solid fa-check text-lg"></i>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-green-800">Reactivar usuario</p>
                    <p className="text-xs text-green-700">Podrá iniciar sesión</p>
                  </div>
                  <i className="fa-solid fa-chevron-right text-green-600"></i>
                </button>
              )}

              <button
                onClick={eliminarDefinitivo}
                className="w-full flex items-center p-4 rounded-lg border-2 border-red-200 bg-red-50 hover:bg-red-100 transition text-left"
              >
                <div className="h-10 w-10 bg-red-200 text-red-700 rounded-lg flex items-center justify-center mr-3">
                  <i className="fa-solid fa-trash text-lg"></i>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-red-800">Eliminar definitivamente</p>
                  <p className="text-xs text-red-700">No se puede deshacer</p>
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

export default Usuarios;