import { useEffect, useState } from "react";
import { useMedidores } from "../hooks/useMedidores";
import { medidorService } from "../services/medidorService";
import { clienteService } from "../services/clienteService";
import { tecnicoService } from "../services/tecnicoService";
import { usuarioService } from "../services/usuarioService";
import type { Medidor } from "../types/medidor";
import type { Cliente } from "../types/cliente";
import type { Tecnico } from "../types/tecnico";
import type { Usuario } from "../types/usuario";
import MapaSelector from "../components/MapaSelector";
import {
  MARCAS_MODELOS,
  ESTADOS_MEDIDOR,
  generarCodigosDisponibles,
  serieDesdeCodigo,
} from "../config/catalogosMedidores";

const Medidores: React.FC = () => {
  const { medidores, loading, error, refetch } = useMedidores();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Medidor | null>(null);
  const [filtro, setFiltro] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState<{ tipo: "exito" | "error"; mensaje: string } | null>(null);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [codigosDisponibles, setCodigosDisponibles] = useState<string[]>([]);
  const [direccionesExistentes, setDireccionesExistentes] = useState<string[]>([]);

  const [form, setForm] = useState<Partial<Medidor> & { direccionNueva?: string }>({
    id_cliente: undefined,
    id_tecnico: undefined,
    id_usuario_registro: undefined,
    codigo_medidor: "",
    marca: "",
    modelo: "",
    numero_serie: "",
    direccion: "",
    direccionNueva: "",
    latitud: -22.0106,
    longitud: -63.6749,
    fecha_instalacion: new Date().toISOString().split("T")[0],
    estado: "Instalado",
    observaciones: "",
  });

  const mostrarToast = (tipo: "exito" | "error", mensaje: string) => {
    setToast({ tipo, mensaje });
    setTimeout(() => setToast(null), 4000);
  };

  // Cargar catálogos
  useEffect(() => {
    async function cargar() {
      try {
        const [c, t, u] = await Promise.all([
          clienteService.getAll(),
          tecnicoService.getAll(),
          usuarioService.getAll(),
        ]);
        setClientes(c);
        setTecnicos(t);
        setUsuarios(u);

        const dirs = Array.from(
          new Set(c.map((x) => x.direccion).filter(Boolean))
        ) as string[];
        setDireccionesExistentes(dirs);
      } catch (err) {
        console.error("Error cargando catálogos:", err);
      }
    }
    cargar();
  }, []);

  // Cuando carga la lista de medidores, calcula el último código
  useEffect(() => {
    if (medidores.length > 0) {
      const numeros = medidores
        .map((m) => Number(m.codigo_medidor.replace("MED-", "")))
        .filter((n) => !isNaN(n));
      const ultimo = numeros.length > 0 ? Math.max(...numeros) : 50;
      setCodigosDisponibles(generarCodigosDisponibles(ultimo, 30));
    } else {
      setCodigosDisponibles(generarCodigosDisponibles(50, 30));
    }
  }, [medidores]);

  // Autocompletar N° Serie desde el código
  useEffect(() => {
    if (form.codigo_medidor && !editando) {
      setForm((f) => ({ ...f, numero_serie: serieDesdeCodigo(f.codigo_medidor || "") }));
    }
  }, [form.codigo_medidor, editando]);

  // Autocompletar dirección cuando elige cliente
  useEffect(() => {
    if (form.id_cliente && !editando) {
      const cli = clientes.find((c) => c.id_cliente === form.id_cliente);
      if (cli?.direccion && !form.direccionNueva) {
        setForm((f) => ({ ...f, direccion: cli.direccion }));
      }
    }
  }, [form.id_cliente, clientes, editando]);

  const abrirCrear = () => {
    setEditando(null);
    setForm({
      id_cliente: undefined,
      id_tecnico: undefined,
      id_usuario_registro: undefined,
      codigo_medidor: codigosDisponibles[0] || "",
      marca: "",
      modelo: "",
      numero_serie: codigosDisponibles[0] ? serieDesdeCodigo(codigosDisponibles[0]) : "",
      direccion: "",
      direccionNueva: "",
      latitud: -22.0106,
      longitud: -63.6749,
      fecha_instalacion: new Date().toISOString().split("T")[0],
      estado: "Instalado",
      observaciones: "",
    });
    setModalAbierto(true);
  };

  const abrirEditar = (m: Medidor) => {
    setEditando(m);
    setForm({ ...m, direccionNueva: "" });
    setModalAbierto(true);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const direccionFinal =
        (form.direccionNueva && form.direccionNueva.trim()) || form.direccion || "";

      const payload = {
        id_cliente: form.id_cliente,
        id_tecnico: form.id_tecnico,
        id_usuario_registro: form.id_usuario_registro,
        codigo_medidor: form.codigo_medidor,
        marca: form.marca,
        modelo: form.modelo,
        numero_serie: form.numero_serie,
        direccion: direccionFinal,
        latitud: form.latitud,
        longitud: form.longitud,
        fecha_instalacion: form.fecha_instalacion,
        estado: form.estado,
        observaciones: form.observaciones,
      };

      if (editando) {
        await medidorService.update(editando.id_medidor!, payload);
        mostrarToast("exito", `Medidor ${form.codigo_medidor} actualizado`);
      } else {
        await medidorService.create(payload as Omit<Medidor, "id_medidor">);
        mostrarToast("exito", `Medidor ${form.codigo_medidor} creado`);
      }
      setModalAbierto(false);
      await refetch();
    } catch (err: any) {
      console.error(err);
      mostrarToast("error", `${err.response?.data?.error || "Error al guardar"}`);
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (m: Medidor) => {
    if (!confirm(`¿Eliminar el medidor ${m.codigo_medidor}?`)) return;
    try {
      await medidorService.delete(m.id_medidor!);
      mostrarToast("exito", `Medidor ${m.codigo_medidor} eliminado`);
      await refetch();
    } catch (err: any) {
      mostrarToast("error", `${err.response?.data?.error || "Error al eliminar"}`);
    }
  };

  const medidoresFiltrados = medidores.filter(
    (m) =>
      m.codigo_medidor?.toLowerCase().includes(filtro.toLowerCase()) ||
      m.direccion?.toLowerCase().includes(filtro.toLowerCase()) ||
      m.numero_serie?.toLowerCase().includes(filtro.toLowerCase()) ||
      (m.cliente_nombre || "").toLowerCase().includes(filtro.toLowerCase())
  );

  const modelosDisponibles = MARCAS_MODELOS[form.marca || ""] || [];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <i className="fa-solid fa-spinner fa-spin text-red-600 text-3xl mr-3"></i>
        <span className="text-red-600 font-semibold">Cargando medidores...</span>
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

  return (
    <div className="p-6 space-y-6">
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

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Medidores</h1>
          <p className="text-sm text-gray-500 mt-1">
            {medidoresFiltrados.length} de {medidores.length} medidores
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Buscar por código, cliente o dirección..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={abrirCrear}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition flex items-center"
          >
            <i className="fa-solid fa-plus mr-2"></i>
            Nuevo Medidor
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr className="text-gray-500 text-xs uppercase">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Dirección</th>
                <th className="py-3 px-4">Marca</th>
                <th className="py-3 px-4">Serie</th>
                <th className="py-3 px-4">Coordenadas</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
              {medidoresFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    <i className="fa-solid fa-inbox text-4xl mb-2 block"></i>
                    No hay medidores para mostrar
                  </td>
                </tr>
              ) : (
                medidoresFiltrados.slice(0, 50).map((m) => (
                  <tr key={m.id_medidor} className="hover:bg-red-50/40">
                    <td className="py-3 px-4 font-mono text-xs text-gray-400">
                      {String(m.id_medidor).padStart(3, "0")}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs font-bold text-red-700">
                      {m.codigo_medidor}
                    </td>
                    <td className="py-3 px-4">{m.cliente_nombre || "-"}</td>
                    <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{m.direccion}</td>
                    <td className="py-3 px-4">{m.marca}</td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-500">{m.numero_serie}</td>
                    <td className="py-3 px-4 font-mono text-[10px] text-gray-400">
                      {Number(m.latitud).toFixed(5)}, {Number(m.longitud).toFixed(5)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          m.estado === "Instalado"
                            ? "bg-green-100 text-green-700"
                            : m.estado === "Mantenimiento"
                            ? "bg-yellow-100 text-yellow-700"
                            : m.estado === "Dañado"
                            ? "bg-red-100 text-red-700"
                            : m.estado === "Inactivo"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {m.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => abrirEditar(m)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg mr-1 hover:bg-blue-50 transition"
                        title="Editar"
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button
                        onClick={() => eliminar(m)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition"
                        title="Eliminar"
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

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-100 bg-red-50 rounded-t-2xl sticky top-0">
              <h2 className="text-lg font-bold text-red-700 flex items-center">
                <i className={`fa-solid ${editando ? "fa-pen" : "fa-plus-circle"} mr-2`}></i>
                {editando ? "Editar Medidor" : "Registrar Nuevo Medidor"}
              </h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-gray-400 hover:text-red-600 text-xl"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={guardar} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código del Medidor *
                  </label>
                  <select
                    required
                    value={form.codigo_medidor || ""}
                    onChange={(e) => setForm({ ...form, codigo_medidor: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Selecciona código</option>
                    {codigosDisponibles.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    N° Serie (autocompletado)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={form.numero_serie || ""}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente *
                  </label>
                  <select
                    required
                    value={form.id_cliente ?? ""}
                    onChange={(e) => setForm({ ...form, id_cliente: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Selecciona cliente</option>
                    {clientes.map((c) => (
                      <option key={c.id_cliente} value={c.id_cliente}>
                        {c.id_cliente} - {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <select
                    value={form.direccion || ""}
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Selecciona dirección existente</option>
                    {direccionesExistentes.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={form.direccionNueva || ""}
                    onChange={(e) => setForm({ ...form, direccionNueva: e.target.value })}
                    placeholder="O escribe una dirección nueva"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca *
                  </label>
                  <select
                    required
                    value={form.marca || ""}
                    onChange={(e) => setForm({ ...form, marca: e.target.value, modelo: "" })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Selecciona marca</option>
                    {Object.keys(MARCAS_MODELOS).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo *
                  </label>
                  <select
                    required
                    disabled={!form.marca}
                    value={form.modelo || ""}
                    onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                  >
                    <option value="">Selecciona modelo</option>
                    {modelosDisponibles.map((mo) => (
                      <option key={mo} value={mo}>{mo}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación — haz clic en el mapa para marcar la casa
                </label>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <input
                    type="number"
                    step="0.00000001"
                    value={form.latitud ?? 0}
                    onChange={(e) => setForm({ ...form, latitud: parseFloat(e.target.value) })}
                    placeholder="Latitud"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="number"
                    step="0.00000001"
                    value={form.longitud ?? 0}
                    onChange={(e) => setForm({ ...form, longitud: parseFloat(e.target.value) })}
                    placeholder="Longitud"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <MapaSelector
                  lat={form.latitud ?? -22.0106}
                  lng={form.longitud ?? -63.6749}
                  onChange={(lat, lng) => setForm({ ...form, latitud: lat, longitud: lng })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Instalación
                  </label>
                  <input
                    type="date"
                    value={form.fecha_instalacion || ""}
                    onChange={(e) => setForm({ ...form, fecha_instalacion: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={form.estado || "Instalado"}
                    onChange={(e) => setForm({ ...form, estado: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {ESTADOS_MEDIDOR.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Técnico *
                  </label>
                  <select
                    required
                    value={form.id_tecnico ?? ""}
                    onChange={(e) => setForm({ ...form, id_tecnico: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Selecciona técnico</option>
                    {tecnicos.map((t) => (
                      <option key={t.id_tecnico} value={t.id_tecnico}>
                        {t.id_tecnico} - {t.nombre} ({t.especialidad})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usuario Registro *
                  </label>
                  <select
                    required
                    value={form.id_usuario_registro ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, id_usuario_registro: Number(e.target.value) })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Selecciona usuario</option>
                    {usuarios.map((u) => (
                      <option key={u.id_usuario} value={u.id_usuario}>
                        {u.id_usuario} - {u.nombre} ({u.rol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  rows={2}
                  value={form.observaciones || ""}
                  onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Observaciones opcionales"
                />
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

export default Medidores;