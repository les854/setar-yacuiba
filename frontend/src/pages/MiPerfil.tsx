import { useEffect, useState } from "react";

const MiPerfil: React.FC = () => {
  const [sesion, setSesion] = useState<any>(null);

  useEffect(() => {
    const s = localStorage.getItem("usuario");
    if (s) setSesion(JSON.parse(s));
  }, []);

  // Datos del cliente (solo lectura)
  const datos = {
    nombre: sesion?.nombre || "Usuario",
    usuario: sesion?.usuario || "-",
    email: `cliente${sesion?.id_usuario || "21"}@gmail.com`,
    telefono: `700${String(sesion?.id_usuario || 21).padStart(4, "0")}`,
    ci_nit: `91${String(sesion?.id_usuario || 21).padStart(7, "0")}`,
    direccion: `Calle Bolivar #${sesion?.id_usuario || 21}`,
    medidor: `MED-${String(sesion?.id_usuario || 21).padStart(4, "0")}`,
  };

  return (
    <div className="p-6 space-y-6">
      {/* ============ HEADER ============ */}
      <div className="bg-red-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold">
            {datos.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{datos.nombre}</h1>
            <p className="text-red-100 text-sm">Cliente SETAR Yacuiba</p>
            <p className="text-red-100 text-xs mt-1">
              <i className="fa-solid fa-id-card mr-1"></i>
              {datos.usuario}
            </p>
          </div>
        </div>
      </div>

      {/* ============ INFO DEL MEDIDOR ============ */}
      <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-red-600">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-gauge-high text-xl"></i>
          </div>
          <div>
            <p className="text-xs text-gray-500">Medidor asignado</p>
            <p className="font-bold text-gray-800 text-lg">{datos.medidor}</p>
            <p className="text-xs text-gray-500">{datos.direccion}</p>
          </div>
        </div>
      </div>

      {/* ============ DATOS PERSONALES (SOLO LECTURA) ============ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 flex items-center">
            <i className="fa-solid fa-user text-red-600 mr-2"></i>
            Datos Personales
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            <i className="fa-solid fa-lock mr-1"></i>
            Solo lectura. Contacta al administrador para modificar tus datos.
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
              Nombre completo
            </label>
            <p className="text-gray-800 font-medium">{datos.nombre}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
              Usuario
            </label>
            <p className="text-gray-800 font-medium font-mono">{datos.usuario}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
              CI / NIT
            </label>
            <p className="text-gray-800 font-medium font-mono">{datos.ci_nit}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
              Email
            </label>
            <p className="text-gray-800 font-medium">{datos.email}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
              Teléfono
            </label>
            <p className="text-gray-800 font-medium">{datos.telefono}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
              Dirección
            </label>
            <p className="text-gray-800 font-medium">{datos.direccion}</p>
          </div>
        </div>
      </div>

      {/* ============ SEGURIDAD ============ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 flex items-center">
            <i className="fa-solid fa-lock text-red-600 mr-2"></i>
            Seguridad
          </h2>
        </div>
        <div className="p-6 space-y-3">
          <div className="w-full text-left p-4 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between opacity-60 cursor-not-allowed">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-key text-gray-400"></i>
              <div>
                <p className="font-semibold text-gray-600 text-sm">
                  Cambiar contraseña
                </p>
                <p className="text-xs text-gray-500">
                  Contacta al administrador
                </p>
              </div>
            </div>
            <i className="fa-solid fa-lock text-gray-400"></i>
          </div>

          <div className="w-full text-left p-4 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between opacity-60 cursor-not-allowed">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-bell text-gray-400"></i>
              <div>
                <p className="font-semibold text-gray-600 text-sm">
                  Notificaciones
                </p>
                <p className="text-xs text-gray-500">
                  Contacta al administrador
                </p>
              </div>
            </div>
            <i className="fa-solid fa-lock text-gray-400"></i>
          </div>
        </div>
      </div>

      {/* ============ INFO ============ */}
      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <i className="fa-solid fa-circle-info mr-2"></i>
          Como cliente solo puedes <strong>consultar</strong> tu información. Si
          necesitas actualizar tus datos, comunícate con SETAR Yacuiba.
        </p>
      </div>
    </div>
  );
};

export default MiPerfil;