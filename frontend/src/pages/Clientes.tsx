import { useState } from "react";
import { useClientes } from "../hooks/useClientes";
import { clienteService } from "../services/clienteService";
import type { Cliente } from "../types/cliente";

const Clientes: React.FC = () => {
  const { clientes, loading, error, refetch } = useClientes();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [filtro, setFiltro] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState("");

  const [form, setForm] = useState<Partial<Cliente>>({
    nombre: "",
    ci_nit: "",
    direccion: "",
    telefono: "",
    email: "",
    estado: true,
  });

  const abrirCrear = () => {
    setEditando(null);
    setErrorModal("");
    setForm({
      nombre: "",
      ci_nit: "",
      direccion: "",
      telefono: "",
      email: "",
      estado: true,
    });
    setModalAbierto(true);
  };

  const abrirEditar = (c: Cliente) => {
    setEditando(c);
    setErrorModal("");
    setForm(c);
    setModalAbierto(true);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setErrorModal("");

    try {
      if (editando) {
        await clienteService.update(editando.id_cliente, form);
      } else {
        await clienteService.create(form as Omit<Cliente, "id_cliente">);
      }
      setModalAbierto(false);
      await refetch();
    } catch (err: any) {
      console.error(err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error al guardar. ¿Iniciaste sesión?";

      if (err.response?.status === 401) {
        setErrorModal(
          " Token inválido. Ve al login e inicia sesión nuevamente."
        );
      } else {
        setErrorModal(msg);
      }
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (id: number) => {
    if (!confirm("¿Eliminar este cliente?")) return;
    try {
      await clienteService.delete(id);
      await refetch();
    } catch (err: any) {
      console.error(err);
      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Error al eliminar. ¿Iniciaste sesión?"
      );
    }
  };

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
      c.ci_nit?.toLowerCase().includes(filtro.toLowerCase()) ||
      c.direccion?.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <i className="fa-solid fa-spinner fa-spin text-red-600 text-3xl mr-3"></i>
        <span className="text-red-600 font-semibold">Cargando clientes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-300 text-red-700 rounded-xl p-4 flex items-center">
          <i className="fa-solid fa-circle-exclamation mr-2"></i>
          {error}
          <button
            onClick={refetch}
            className="ml-4 underline font-semibold"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Gestión de Clientes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {clientesFiltrados.length} de {clientes.length} clientes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={abrirCrear}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition flex items-center"
          >
            <i className="fa-solid fa-plus mr-2"></i>
            Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr className="text-gray-500 text-xs uppercase">
                <th className="py-3 px-4 font-semibold">ID</th>
                <th className="py-3 px-4 font-semibold">Nombre</th>
                <th className="py-3 px-4 font-semibold">CI/NIT</th>
                <th className="py-3 px-4 font-semibold">Dirección</th>
                <th className="py-3 px-4 font-semibold">Teléfono</th>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-4 font-semibold">Estado</th>
                <th className="py-3 px-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
              {clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-400">
                    <i className="fa-solid fa-inbox text-3xl mb-2 block"></i>
                    No hay clientes para mostrar
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((c) => (
                  <tr key={c.id_cliente} className="hover:bg-red-50/40">
                    <td className="py-3 px-4 font-mono text-xs text-gray-400">
                      {String(c.id_cliente).padStart(3, "0")}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-xs mr-3">
                          {c.nombre?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span className="font-medium">{c.nombre}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">{c.ci_nit}</td>
                    <td className="py-3 px-4 text-gray-500">{c.direccion}</td>
                    <td className="py-3 px-4">{c.telefono}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">
                       {c.email || "-"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          c.estado
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {c.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => abrirEditar(c)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg mr-1 hover:bg-red-50"
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button
                        onClick={() => eliminar(c.id_cliente)}
                        className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50"
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

      {/* Modal */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-100 bg-red-50 rounded-t-2xl">
              <h2 className="text-lg font-bold text-red-700 flex items-center">
                <i
                  className={`fa-solid ${
                    editando ? "fa-pen" : "fa-user-plus"
                  } mr-2`}
                ></i>
                {editando ? "Editar Cliente" : "Registrar Nuevo Cliente"}
              </h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-gray-400 hover:text-red-600 text-xl"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={guardar} className="p-6 space-y-4">
              {errorModal && (
                <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-2.5">
                  <i className="fa-solid fa-circle-exclamation mr-2"></i>
                  {errorModal}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={form.nombre || ""}
                  onChange={(e) =>
                    setForm({ ...form, nombre: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CI/NIT *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.ci_nit || ""}
                    onChange={(e) =>
                      setForm({ ...form, ci_nit: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.telefono || ""}
                    onChange={(e) =>
                      setForm({ ...form, telefono: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección *
                </label>
                <input
                  type="text"
                  required
                  value={form.direccion || ""}
                  onChange={(e) =>
                    setForm({ ...form, direccion: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email || ""}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="estado"
                  checked={form.estado ?? true}
                  onChange={(e) =>
                    setForm({ ...form, estado: e.target.checked })
                  }
                  className="w-4 h-4 accent-red-600"
                />
                <label htmlFor="estado" className="text-sm text-gray-700">
                  Cliente activo
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
    </div>
  );
};

export default Clientes;