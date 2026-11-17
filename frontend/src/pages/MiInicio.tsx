import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const MiInicio: React.FC = () => {
  const [sesion, setSesion] = useState<any>(null);

  useEffect(() => {
    const s = localStorage.getItem("usuario");
    if (s) setSesion(JSON.parse(s));
  }, []);

  const datos = {
    medidor: "MED-0021",
    direccion: "Calle Bolivar #21",
    consumoActual: 145,
    consumoAnterior: 132,
    deuda: 125.50,
    fechaVencimiento: "2026-09-25",
    estadoFactura: "Pendiente",
  };

  const variacion = ((datos.consumoActual - datos.consumoAnterior) / datos.consumoAnterior) * 100;

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-red-700 to-red-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          ¡Hola, {sesion?.nombre}!
        </h1>
        <p className="text-red-100">Bienvenido a tu panel de cliente - SETAR Yacuiba</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-gauge-high"></i>
          </div>
          <div>
            <h2 className="font-bold text-gray-800">Tu Medidor</h2>
            <p className="text-xs text-gray-500">{datos.medidor} - {datos.direccion}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Consumo del Mes</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">
            {datos.consumoActual} <span className="text-sm">kWh</span>
          </h3>
          <p className={`text-xs mt-1 ${variacion >= 0 ? "text-red-600" : "text-green-600"}`}>
            <i className={`fa-solid fa-arrow-${variacion >= 0 ? "up" : "down"} mr-1`}></i>
            {variacion.toFixed(1)}% vs mes anterior
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-red-600">
          <p className="text-sm text-gray-500">Monto a Pagar</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">
            Bs. {datos.deuda.toFixed(2)}
          </h3>
          <p className="text-xs text-red-600 mt-1">
            <i className="fa-solid fa-clock mr-1"></i>
            Vence el {datos.fechaVencimiento}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">Estado de Factura</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">
            {datos.estadoFactura}
          </h3>
          <Link
            to="/mi-pago"
            className="text-xs text-red-600 hover:underline mt-1 inline-block font-semibold"
          >
            Pagar ahora <i className="fa-solid fa-arrow-right ml-1"></i>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <Link to="/mi-consumo" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-red-300 hover:shadow-md transition text-center">
          <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
            <i className="fa-solid fa-chart-line text-xl"></i>
          </div>
          <p className="font-semibold text-gray-800 text-sm">Mi Consumo</p>
        </Link>

        <Link to="/mi-facturacion" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-red-300 hover:shadow-md transition text-center">
          <div className="h-12 w-12 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-2">
            <i className="fa-solid fa-file-invoice-dollar text-xl"></i>
          </div>
          <p className="font-semibold text-gray-800 text-sm">Facturación</p>
        </Link>

        <Link to="/mi-pago" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-red-300 hover:shadow-md transition text-center">
          <div className="h-12 w-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mx-auto mb-2">
            <i className="fa-solid fa-qrcode text-xl"></i>
          </div>
          <p className="font-semibold text-gray-800 text-sm">Pagar</p>
        </Link>

        <Link to="/reclamos" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-red-300 hover:shadow-md transition text-center">
          <div className="h-12 w-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mx-auto mb-2">
            <i className="fa-solid fa-comment-dots text-xl"></i>
          </div>
          <p className="font-semibold text-gray-800 text-sm">Reclamos</p>
        </Link>
      </div>

      <div className="bg-red-50 border-l-4 border-red-600 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <i className="fa-solid fa-circle-exclamation text-red-600 text-xl"></i>
          <div>
            <h3 className="font-bold text-red-800">Recordatorio de pago</h3>
            <p className="text-sm text-red-700 mt-1">
              Tienes un saldo pendiente de <strong>Bs. {datos.deuda.toFixed(2)}</strong>.
              Vence el <strong>{datos.fechaVencimiento}</strong>.
            </p>
            <Link
              to="/mi-pago"
              className="inline-block mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700"
            >
              <i className="fa-solid fa-qrcode mr-2"></i>
              Pagar con QR
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiInicio;