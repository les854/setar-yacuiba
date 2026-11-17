import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Factura {
  id: string;
  periodo: string;
  monto: number;
  consumo: number;
  vence: string;
}

const MiPago: React.FC = () => {
  const navigate = useNavigate();
  const [metodo, setMetodo] = useState<"qr" | "transferencia">("qr");
  const [factura, setFactura] = useState<Factura | null>(null);
  const [pagando, setPagando] = useState(false);
  const [pagado, setPagado] = useState(false);

  useEffect(() => {
    // Leer la factura pendiente del localStorage
    const data = localStorage.getItem("facturaPendiente");
    if (data) {
      try {
        setFactura(JSON.parse(data));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Factura por defecto si no se seleccionó ninguna
      setFactura({
        id: "FAC-2026-09",
        periodo: "Septiembre 2026",
        monto: 125.50,
        consumo: 145,
        vence: "2026-09-25",
      });
    }
  }, []);

  if (!factura) return null;

  const qrData = `SETAR-YACUIBA|PAGO|FACTURA:${factura.id}|MONTO:${factura.monto}|CLIENTE:user0021`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;

  //  Confirmar pago
  const confirmarPago = () => {
    setPagando(true);
    setTimeout(() => {
      setPagando(false);
      setPagado(true);
      localStorage.removeItem("facturaPendiente");
      setTimeout(() => {
        navigate("/mi-facturacion");
      }, 3000);
    }, 1500);
  };

  if (pagado) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center max-w-lg mx-auto mt-12">
          <div className="h-24 w-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-check text-5xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            ¡Pago Exitoso!
          </h1>
          <p className="text-gray-500 mb-4">
            Tu factura <strong>{factura.id}</strong> por <strong>Bs. {factura.monto.toFixed(2)}</strong> ha sido pagada.
          </p>
          <p className="text-xs text-gray-400">
            Recibirás el comprobante en tu correo.
            <br />
            Redirigiendo a facturación...
          </p>
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 text-left">
            <p className="text-xs text-green-800">
              <i className="fa-solid fa-receipt mr-2"></i>
              <strong>N° de transacción:</strong> TX-{Date.now()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">
          <i className="fa-solid fa-qrcode mr-2"></i>
          Pagar mi Factura
        </h1>
        <p className="text-red-100 text-sm mt-1">Selecciona el método de pago</p>
      </div>

      {/* Botón volver */}
      <button
        onClick={() => navigate("/mi-facturacion")}
        className="text-red-600 hover:text-red-800 text-sm font-semibold flex items-center"
      >
        <i className="fa-solid fa-arrow-left mr-2"></i>
        Volver a Facturación
      </button>

      {/* Monto a pagar */}
      <div className="bg-white p-8 rounded-xl shadow-sm border-l-4 border-red-600 text-center">
        <p className="text-sm text-gray-500 mb-2">Monto a Pagar</p>
        <h2 className="text-4xl font-bold text-gray-800 mb-2">
          Bs. {factura.monto.toFixed(2)}
        </h2>
        <p className="text-xs text-red-600">
          Factura {factura.id} - Vence el {factura.vence}
        </p>
      </div>

      {/* Métodos */}
      <div className="grid grid-cols-2 gap-5">
        <button
          onClick={() => setMetodo("qr")}
          className={`p-5 rounded-xl border-2 transition ${
            metodo === "qr" ? "border-red-600 bg-red-50" : "border-gray-200 bg-white hover:border-red-300"
          }`}
        >
          <i className={`fa-solid fa-qrcode text-3xl mb-2 ${metodo === "qr" ? "text-red-600" : "text-gray-400"}`}></i>
          <p className="font-bold text-gray-800">Pago con QR</p>
          <p className="text-xs text-gray-500 mt-1">Escanea y paga al instante</p>
        </button>

        <button
          onClick={() => setMetodo("transferencia")}
          className={`p-5 rounded-xl border-2 transition ${
            metodo === "transferencia" ? "border-red-600 bg-red-50" : "border-gray-200 bg-white hover:border-red-300"
          }`}
        >
          <i className={`fa-solid fa-building-columns text-3xl mb-2 ${metodo === "transferencia" ? "text-red-600" : "text-gray-400"}`}></i>
          <p className="font-bold text-gray-800">Transferencia</p>
          <p className="text-xs text-gray-500 mt-1">Datos bancarios</p>
        </button>
      </div>

      {/* Contenido */}
      {metodo === "qr" ? (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
          <h3 className="font-bold text-gray-800 mb-4">
            <i className="fa-solid fa-mobile-screen-button text-red-600 mr-2"></i>
            Escanea este código QR con tu celular
          </h3>

          <div className="inline-block bg-white p-4 rounded-xl border-4 border-red-600">
            <img src={qrUrl} alt="QR de pago" className="w-64 h-64 mx-auto" />
          </div>

          <div className="mt-6 space-y-2">
            <p className="text-sm font-semibold text-gray-800">
              Código: <span className="font-mono text-red-600">{factura.id}</span>
            </p>
            <p className="text-xs text-gray-500">
              Compatible con: Banco Unión, BNB, BMSC, Mercantil Santa Cruz, BCP
            </p>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <p className="text-sm text-blue-800 font-semibold mb-2">
              <i className="fa-solid fa-circle-info mr-2"></i>
              Instrucciones:
            </p>
            <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
              <li>Abre la app de tu banco</li>
              <li>Selecciona "Pago QR" o "Escanear QR"</li>
              <li>Escanea este código</li>
              <li>Confirma el monto (Bs. {factura.monto.toFixed(2)})</li>
              <li>Autoriza el pago</li>
              <li>Vuelve aquí y confirma</li>
            </ol>
          </div>

          <button
            onClick={confirmarPago}
            disabled={pagando}
            className="mt-6 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {pagando ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                Verificando pago...
              </>
            ) : (
              <>
                <i className="fa-solid fa-check-circle mr-2"></i>
                Ya pagué, verificar
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">
            <i className="fa-solid fa-building-columns text-red-600 mr-2"></i>
            Datos para transferencia bancaria
          </h3>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Banco</p>
              <p className="font-semibold text-gray-800">Banco Unión S.A.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Cuenta</p>
              <p className="font-mono font-semibold text-gray-800">10000012345678</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Titular</p>
              <p className="font-semibold text-gray-800">SETAR Yacuiba</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">NIT</p>
              <p className="font-mono font-semibold text-gray-800">1020304050</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Referencia</p>
              <p className="font-mono font-semibold text-gray-800">{factura.id}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-600">
              <p className="text-xs text-red-600 mb-1 font-semibold">Monto a transferir</p>
              <p className="font-bold text-2xl text-red-700">Bs. {factura.monto.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-xs text-yellow-800">
              <i className="fa-solid fa-triangle-exclamation mr-2"></i>
              Envía el comprobante a <strong>pagos@setar.gob.bo</strong> con tu número de factura.
            </p>
          </div>

          <button
            onClick={confirmarPago}
            disabled={pagando}
            className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {pagando ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                Verificando pago...
              </>
            ) : (
              <>
                <i className="fa-solid fa-check-circle mr-2"></i>
                Ya transferí, verificar
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default MiPago;