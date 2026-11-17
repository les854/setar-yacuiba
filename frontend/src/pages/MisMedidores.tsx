import { useEffect, useState } from "react";
import { medidorService } from "../services/medidorService";
import { lecturaService, type Lectura } from "../services/lecturaService";
import type { Medidor } from "../types/medidor";

const MisMedidores: React.FC = () => {
  const [medidores, setMedidores] = useState<Medidor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  // 🎯 Estado del modal
  const [modalLectura, setModalLectura] = useState(false);
  const [medidorSeleccionado, setMedidorSeleccionado] = useState<Medidor | null>(null);
  const [ultimaLectura, setUltimaLectura] = useState<Lectura | null>(null);
  const [cargandoUltima, setCargandoUltima] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState<{ tipo: "exito" | "error"; mensaje: string } | null>(null);

  const [form, setForm] = useState({
    lectura_actual: "",
    observaciones: "",
  });

  const mostrarToast = (tipo: "exito" | "error", mensaje: string) => {
    setToast({ tipo, mensaje });
    setTimeout(() => setToast(null), 4000);
  };

  //  Cargar medidores del técnico
  useEffect(() => {
    medidorService
      .getMisMedidores()
      .then(setMedidores)
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.error || "Error al cargar tus medidores");
      })
      .finally(() => setLoading(false));
  }, []);

  //  Abrir modal
  const abrirModalLectura = async (medidor: Medidor) => {
    console.log(" Clic en Registrar Lectura:", medidor.codigo_medidor);
    setMedidorSeleccionado(medidor);
    setForm({ lectura_actual: "", observaciones: "" });
    setUltimaLectura(null);
    setModalLectura(true);
    setCargandoUltima(true);

    try {
      const ultima = await lecturaService.getUltimaLectura(medidor.id_medidor);
      console.log(" Última lectura:", ultima);
      setUltimaLectura(ultima);
      if (ultima) {
        setForm({
          lectura_actual: String(Number(ultima.lectura_actual) + 10),
          observaciones: "",
        });
      } else {
        setForm({ lectura_actual: "100", observaciones: "" });
      }
    } catch (err) {
      console.error("❌ Error al obtener última lectura:", err);
    } finally {
      setCargandoUltima(false);
    }
  };

  //  Guardar lectura
  const guardarLectura = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medidorSeleccionado) return;

    const lecturaNum = Number(form.lectura_actual);
    if (isNaN(lecturaNum) || lecturaNum <= 0) {
      mostrarToast("error", "Ingresa una lectura válida");
      return;
    }

    if (ultimaLectura && lecturaNum <= Number(ultimaLectura.lectura_actual)) {
      mostrarToast(
        "error",
        `La lectura debe ser mayor a la anterior (${ultimaLectura.lectura_actual})`
      );
      return;
    }

    setGuardando(true);
    try {
      const sesionStr = localStorage.getItem("usuario");
      const sesion = sesionStr ? JSON.parse(sesionStr) : null;
      const idUsuario = sesion?.id_usuario || sesion?.id;

      // Obtener el id_tecnico
      const res = await fetch(
        `http://localhost:4000/api/tecnicos?id_usuario=${idUsuario}`
      );
      const tecnicosData = await res.json();
      const idTecnico = tecnicosData[0]?.id_tecnico || 6;

      console.log("📤 Enviando:", {
        id_medidor: medidorSeleccionado.id_medidor,
        id_tecnico: idTecnico,
        lectura_actual: lecturaNum,
      });

      await lecturaService.create({
        id_medidor: medidorSeleccionado.id_medidor,
        id_tecnico: idTecnico,
        lectura_actual: lecturaNum,
        observaciones: form.observaciones,
      });

      mostrarToast("exito", ` Lectura registrada: ${lecturaNum} kWh`);
      setTimeout(() => setModalLectura(false), 1500);
    } catch (err: any) {
      console.error(" Error al guardar:", err);
      mostrarToast(
        "error",
        `❌ ${err.response?.data?.error || "Error al guardar"}`
      );
    } finally {
      setGuardando(false);
    }
  };

  const medidoresFiltrados = medidores.filter((m) => {
    const coincideBusqueda =
      m.codigo_medidor?.toLowerCase().includes(filtro.toLowerCase()) ||
      m.direccion?.toLowerCase().includes(filtro.toLowerCase()) ||
      (m.cliente_nombre || "").toLowerCase().includes(filtro.toLowerCase());
    const coincideEstado = filtroEstado === "Todos" || m.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });

  if (loading) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
        Cargando tus medidores...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-xl p-4 flex items-center">
          <i className="fa-solid fa-triangle-exclamation mr-2"></i>
          {error}
        </div>
      </div>
    );
  }

  const estados = ["Todos", "Instalado", "Mantenimiento", "Dañado", "Inactivo", "En revisión"];

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
        <h1 className="text-2xl font-bold text-white flex items-center">
          <i className="fa-solid fa-gauge-high mr-2"></i>
          Mis Medidores Asignados
        </h1>
        <p className="text-red-100 text-sm mt-1">
          {medidoresFiltrados.length} de {medidores.length} medidores
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Buscar medidor..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm flex-1 min-w-[240px] focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <div className="flex flex-wrap gap-2">
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
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr className="text-gray-500 text-xs uppercase">
              <th className="py-3 px-4">Código</th>
              <th className="py-3 px-4">Cliente</th>
              <th className="py-3 px-4">Dirección</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
            {medidoresFiltrados.map((m) => (
              <tr key={m.id_medidor} className="hover:bg-red-50/40">
                <td className="py-3 px-4 font-mono text-xs font-bold text-red-700">
                  {m.codigo_medidor}
                </td>
                <td className="py-3 px-4">{m.cliente_nombre || "-"}</td>
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
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => abrirModalLectura(m)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition inline-flex items-center gap-1 text-xs font-semibold"
                  >
                    <i className="fa-solid fa-clipboard-list"></i>
                    Registrar Lectura
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalLectura && medidorSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-100 bg-red-50 rounded-t-2xl">
              <h2 className="text-lg font-bold text-red-700">
                <i className="fa-solid fa-clipboard-list mr-2"></i>
                Registrar Lectura
              </h2>
              <button
                onClick={() => setModalLectura(false)}
                className="text-gray-400 hover:text-red-600 text-xl"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={guardarLectura} className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-bold text-gray-800">
                  {medidorSeleccionado.codigo_medidor}
                </p>
                <p className="text-xs text-gray-500">
                   {medidorSeleccionado.cliente_nombre}
                </p>
                <p className="text-xs text-gray-500">
                   {medidorSeleccionado.direccion}
                </p>
              </div>

              {cargandoUltima ? (
                <div className="text-center text-gray-400 text-sm py-2">
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  Cargando última lectura...
                </div>
              ) : ultimaLectura ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700 font-semibold mb-1">
                    ÚLTIMA LECTURA
                  </p>
                  <p className="text-2xl font-bold text-blue-800">
                    {Number(ultimaLectura.lectura_actual).toFixed(2)} kWh
                  </p>
                  <p className="text-xs text-blue-600">
                    Registrada el {ultimaLectura.fecha_lectura}
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center text-xs text-gray-500">
                  No hay lecturas previas
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva lectura (kWh) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.lectura_actual}
                  onChange={(e) =>
                    setForm({ ...form, lectura_actual: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Ej: 1500.50"
                />
                {ultimaLectura && form.lectura_actual && (
                  <p className="text-xs text-green-600 mt-1 font-semibold">
                    <i className="fa-solid fa-bolt mr-1"></i>
                    Consumo:{" "}
                    {(
                      Number(form.lectura_actual) -
                      Number(ultimaLectura.lectura_actual)
                    ).toFixed(2)}{" "}
                    kWh
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  rows={2}
                  value={form.observaciones}
                  onChange={(e) =>
                    setForm({ ...form, observaciones: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Opcional"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setModalLectura(false)}
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center"
                >
                  {guardando ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-save mr-2"></i>
                      Guardar
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

export default MisMedidores;