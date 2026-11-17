import { useState } from "react";

const Reclamos: React.FC = () => {
  const [form, setForm] = useState({
    tipo: "Falla del servicio",
    asunto: "",
    descripcion: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const reclamos = [
    {
      id: 1,
      fecha: "2026-09-10",
      tipo: "Falla del servicio",
      asunto: "Corte de luz en el barrio",
      estado: "Resuelto",
    },
    {
      id: 2,
      fecha: "2026-08-22",
      tipo: "Error en facturación",
      asunto: "Monto incorrecto en factura",
      estado: "En proceso",
    },
  ];

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      setEnviado(true);
      setForm({ tipo: "Falla del servicio", asunto: "", descripcion: "" });
      setTimeout(() => setEnviado(false), 4000);
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-red-700 to-red-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">
          <i className="fa-solid fa-comment-dots mr-2"></i>
          Mis Reclamos
        </h1>
        <p className="text-red-100 text-sm mt-1">
          Envía y consulta el estado de tus reclamos
        </p>
      </div>

      {/* Formulario nuevo reclamo */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 flex items-center">
            <i className="fa-solid fa-plus-circle text-red-600 mr-2"></i>
            Nuevo Reclamo
          </h2>
        </div>

        <form onSubmit={enviar} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Reclamo
            </label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
            >
              <option>Falla del servicio</option>
              <option>Error en facturación</option>
              <option>Problema con el medidor</option>
              <option>Solicitud de reconexión</option>
              <option>Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asunto
            </label>
            <input
              type="text"
              required
              value={form.asunto}
              onChange={(e) => setForm({ ...form, asunto: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
              placeholder="Ej: Corte de luz en mi barrio"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              required
              rows={4}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
              placeholder="Describe tu problema con detalle..."
            />
          </div>

          {enviado && (
            <div className="bg-green-50 border border-green-300 text-green-700 rounded-lg px-4 py-3 flex items-center">
              <i className="fa-solid fa-check-circle mr-2"></i>
              Reclamo enviado correctamente. Recibirás respuesta pronto.
            </div>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {enviando ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                Enviando...
              </>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane mr-2"></i>
                Enviar Reclamo
              </>
            )}
          </button>
        </form>
      </div>

      {/* Historial */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 flex items-center">
            <i className="fa-solid fa-history text-red-600 mr-2"></i>
            Historial de Reclamos
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {reclamos.map((r) => (
            <div key={r.id} className="p-5 hover:bg-gray-50">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                      {r.tipo}
                    </span>
                    <span className="text-xs text-gray-400">
                      <i className="fa-solid fa-calendar mr-1"></i>
                      {r.fecha}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-800">{r.asunto}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    r.estado === "Resuelto"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {r.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reclamos;