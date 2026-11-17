import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

interface Factura {
  id: string;
  periodo: string;
  monto: number;
  estado: "Pendiente" | "Pagada";
  vence: string;
  consumo: number;
  cliente: string;
  medidor: string;
  direccion: string;
}

const MiFacturacion: React.FC = () => {
  const navigate = useNavigate();

  const facturas: Factura[] = [
    { id: "FAC-2026-09", periodo: "Septiembre 2026", monto: 125.50, estado: "Pendiente", vence: "2026-09-25", consumo: 145, cliente: "Usuario 21", medidor: "MED-0021", direccion: "Calle Bolivar #21" },
    { id: "FAC-2026-08", periodo: "Agosto 2026", monto: 145.20, estado: "Pagada", vence: "2026-08-25", consumo: 132, cliente: "Usuario 21", medidor: "MED-0021", direccion: "Calle Bolivar #21" },
    { id: "FAC-2026-07", periodo: "Julio 2026", monto: 138.90, estado: "Pagada", vence: "2026-07-25", consumo: 170, cliente: "Usuario 21", medidor: "MED-0021", direccion: "Calle Bolivar #21" },
    { id: "FAC-2026-06", periodo: "Junio 2026", monto: 152.30, estado: "Pagada", vence: "2026-06-25", consumo: 155, cliente: "Usuario 21", medidor: "MED-0021", direccion: "Calle Bolivar #21" },
    { id: "FAC-2026-05", periodo: "Mayo 2026", monto: 145.00, estado: "Pagada", vence: "2026-05-25", consumo: 160, cliente: "Usuario 21", medidor: "MED-0021", direccion: "Calle Bolivar #21" },
  ];

  //  Generar PDF de la factura
  const descargarPDF = (f: Factura) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Encabezado rojo
    doc.setFillColor(220, 38, 38); // rojo #dc2626
    doc.rect(0, 0, pageWidth, 35, "F");

    // Logo/Título SETAR
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("SETAR YACUIBA", 20, 18);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Sistema de Geolocalizacion de Medidores", 20, 26);

    // Título factura
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("FACTURA DE CONSUMO ELECTRICO", 20, 55);

    // Número de factura
    doc.setFontSize(11);
    doc.setTextColor(220, 38, 38);
    doc.text(`N° ${f.id}`, 20, 65);

    // Línea separadora
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.5);
    doc.line(20, 70, pageWidth - 20, 70);

    // Datos del cliente
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DEL CLIENTE", 20, 82);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Nombre: ${f.cliente}`, 20, 92);
    doc.text(`Medidor: ${f.medidor}`, 20, 100);
    doc.text(`Direccion: ${f.direccion}`, 20, 108);
    doc.text(`Periodo: ${f.periodo}`, 20, 116);
    doc.text(`Vencimiento: ${f.vence}`, 20, 124);

    // Detalle de consumo
    doc.setFont("helvetica", "bold");
    doc.text("DETALLE DE CONSUMO", 20, 142);

    // Tabla
    doc.setFillColor(245, 245, 245);
    doc.rect(20, 148, pageWidth - 40, 10, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Concepto", 25, 155);
    doc.text("Valor", pageWidth - 40, 155);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Consumo del periodo (kWh)", 25, 168);
    doc.text(`${f.consumo} kWh`, pageWidth - 40, 168);

    doc.text("Tarifa por kWh", 25, 178);
    doc.text(`Bs. ${(f.monto / f.consumo).toFixed(2)}`, pageWidth - 40, 178);

    // Total
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(20, 190, pageWidth - 20, 190);

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL A PAGAR:", 20, 205);
    doc.setTextColor(220, 38, 38);
    doc.text(`Bs. ${f.monto.toFixed(2)}`, pageWidth - 40, 205);

    // Estado
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    if (f.estado === "Pagada") {
      doc.setFillColor(34, 197, 94); // verde
      doc.rect(20, 220, 50, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("PAGADA", 32, 227);
    } else {
      doc.setFillColor(220, 38, 38); // rojo
      doc.rect(20, 220, 60, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("PENDIENTE DE PAGO", 24, 227);
    }

    // Footer
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("SETAR Yacuiba - Servicio Electrico - Yacuiba, Tarija - Bolivia", 20, 260);
    doc.text("Tel: (4) 682-1234 | Email: info@setar.gob.bo", 20, 266);
    doc.text("Este documento es un comprobante oficial de facturacion.", 20, 272);

    // Descargar
    doc.save(`${f.id}.pdf`);
  };

  //  Ir a pagar
  const irAPagar = (f: Factura) => {
    // Guardar la factura a pagar en localStorage
    localStorage.setItem("facturaPendiente", JSON.stringify(f));
    navigate("/mi-pago");
  };

  const totalPendiente = facturas
    .filter((f) => f.estado === "Pendiente")
    .reduce((sum, f) => sum + f.monto, 0);

  const totalPagado = facturas
    .filter((f) => f.estado === "Pagada")
    .reduce((sum, f) => sum + f.monto, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">
          <i className="fa-solid fa-file-invoice-dollar mr-2"></i>
          Mis Facturas
        </h1>
        <p className="text-red-100 text-sm mt-1">Historial de facturación</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-red-600">
          <p className="text-sm text-gray-500">Saldo Pendiente</p>
          <h3 className="text-2xl font-bold text-red-600">
            Bs. {totalPendiente.toFixed(2)}
          </h3>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Pagado Este Año</p>
          <h3 className="text-2xl font-bold text-green-600">
            Bs. {totalPagado.toFixed(2)}
          </h3>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Total Facturas</p>
          <h3 className="text-2xl font-bold text-gray-800">{facturas.length}</h3>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Historial de Facturas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-gray-500 text-xs uppercase">
                <th className="py-3 px-6 text-left">N° Factura</th>
                <th className="py-3 px-6 text-left">Periodo</th>
                <th className="py-3 px-6 text-right">Monto</th>
                <th className="py-3 px-6 text-left">Vencimiento</th>
                <th className="py-3 px-6 text-center">Estado</th>
                <th className="py-3 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {facturas.map((f) => (
                <tr key={f.id} className="border-t border-gray-100 hover:bg-red-50/40">
                  <td className="py-3 px-6 font-mono text-xs font-bold text-red-700">
                    {f.id}
                  </td>
                  <td className="py-3 px-6">{f.periodo}</td>
                  <td className="py-3 px-6 text-right font-mono font-semibold">
                    Bs. {f.monto.toFixed(2)}
                  </td>
                  <td className="py-3 px-6 text-gray-500">{f.vence}</td>
                  <td className="py-3 px-6 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        f.estado === "Pagada"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {f.estado}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right whitespace-nowrap">
                    {/* Botón PDF */}
                    <button
                      onClick={() => descargarPDF(f)}
                      className="text-red-600 hover:text-red-800 font-semibold text-xs mr-3 hover:bg-red-50 px-2 py-1 rounded transition"
                      title="Descargar PDF"
                    >
                      <i className="fa-solid fa-file-pdf mr-1"></i>
                      PDF
                    </button>

                    {/* Botón Pagar (solo si está pendiente) */}
                    {f.estado === "Pendiente" ? (
                      <button
                        onClick={() => irAPagar(f)}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-3 py-1.5 rounded transition"
                        title="Pagar esta factura"
                      >
                        <i className="fa-solid fa-qrcode mr-1"></i>
                        Pagar
                      </button>
                    ) : (
                      <span className="text-xs text-green-600 font-semibold">
                        <i className="fa-solid fa-check-circle mr-1"></i>
                        Pagada
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <i className="fa-solid fa-circle-info mr-2"></i>
          Puedes <strong>descargar el PDF</strong> de cada factura para tus registros,
          o hacer clic en <strong>Pagar</strong> para pagar online con QR.
        </p>
      </div>
    </div>
  );
};

export default MiFacturacion;