// backend/src/controllers/clienteController.js
const clienteService = require('../services/clienteService');

// ============================================
// LOGIN de cliente
// ============================================
exports.login = async (req, res, next) => {
  try {
    const { usuario, password } = req.body;

    console.log(' Login cliente:', { usuario });

    if (!usuario || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
    }

    const result = await clienteService.login(usuario, password);

    res.json(result);
  } catch (err) {
    console.error(' Error login cliente:', err.message);
    next(err);
  }
};

// ============================================
// Todos los clientes
// ============================================
exports.findAll = async (req, res, next) => {
  try {
    const clientes = await clienteService.findAll();
    res.json(clientes);
  } catch (err) {
    next(err);
  }
};

// ============================================
// Cliente por ID
// ============================================
exports.findById = async (req, res, next) => {
  try {
    const cliente = await clienteService.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.json(cliente);
  } catch (err) {
    next(err);
  }
};

// ============================================
// Medidor del cliente
// ============================================
exports.getMedidor = async (req, res, next) => {
  try {
    const medidor = await clienteService.getMedidor(req.params.idCliente);
    if (!medidor) {
      return res.status(404).json({ message: 'No tienes medidor asignado' });
    }
    res.json(medidor);
  } catch (err) {
    next(err);
  }
};

// ============================================
// Consumo diario
// ============================================
exports.getConsumoDiario = async (req, res, next) => {
  try {
    const data = await clienteService.getConsumoDiario(req.params.idMedidor);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// ============================================
// Consumo por hora
// ============================================
exports.getConsumoPorHora = async (req, res, next) => {
  try {
    const data = await clienteService.getConsumoPorHora(
      req.params.idMedidor,
      req.query.fecha
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// ============================================
// Historial de lecturas
// ============================================
exports.getHistorialLecturas = async (req, res, next) => {
  try {
    const data = await clienteService.getHistorialLecturas(req.params.idMedidor);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// ============================================
// Crear ticket
// ============================================
exports.crearTicket = async (req, res, next) => {
  try {
    const ticket = await clienteService.crearTicket(req.body);
    res.status(201).json({
      message: 'Ticket creado',
      ticket,
    });
  } catch (err) {
    next(err);
  }
};

// ============================================
// Tickets del cliente
// ============================================
exports.getTickets = async (req, res, next) => {
  try {
    const tickets = await clienteService.getTickets(req.params.idCliente);
    res.json(tickets);
  } catch (err) {
    // Si la tabla no existe, devolver array vacío
    res.json([]);
  }
};

// ============================================
// Crear cliente (por si lo necesitas)
// ============================================
exports.create = async (req, res, next) => {
  try {
    res.status(501).json({ message: 'No implementado' });
  } catch (err) {
    next(err);
  }
};

// ============================================
// Actualizar cliente
// ============================================
exports.update = async (req, res, next) => {
  try {
    res.status(501).json({ message: 'No implementado' });
  } catch (err) {
    next(err);
  }
};

// ============================================
// Eliminar cliente
// ============================================
exports.delete = async (req, res, next) => {
  try {
    res.status(501).json({ message: 'No implementado' });
  } catch (err) {
    next(err);
  }
};
// ============================================
// Obtener saldo
// ============================================
exports.getSaldo = async (req, res, next) => {
  try {
    const data = await clienteService.getSaldo(req.params.idCliente);
    if (!data) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// ============================================
// Pagar con QR
// ============================================
exports.pagarQR = async (req, res, next) => {
  try {
    const { idCliente } = req.params;
    const { monto, metodo } = req.body;

    if (!monto || monto <= 0) {
      return res.status(400).json({ message: 'Monto inválido' });
    }

    const result = await clienteService.pagarQR(idCliente, monto, metodo);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
// ============================================
// Detalle de un pago
// ============================================
exports.getPagoDetalle = async (req, res, next) => {
  try {
    const pago = await clienteService.getPagoDetalle(req.params.idPago);
    if (!pago) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }
    res.json(pago);
  } catch (err) {
    next(err);
  }
};

// ============================================
// Historial de pagos
// ============================================
exports.getHistorialPagos = async (req, res, next) => {
  try {
    const historial = await clienteService.getHistorialPagos(req.params.idCliente);
    res.json(historial);
  } catch (err) {
    next(err);
  }
};

// ============================================
// Generar PDF del recibo
// ============================================
exports.generarPDFRecibo = async (req, res, next) => {
  try {
    const { idPago } = req.params;

    const pago = await clienteService.getPagoDetalle(idPago);
    if (!pago) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    // Generar HTML del recibo
    const html = generarHTMLRecibo(pago);

    // Devolver HTML (el cliente lo convierte a PDF)
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    next(err);
  }
};

// ============================================
// Función que genera el HTML del recibo
// ============================================
function generarHTMLRecibo(pago) {
  const fecha = new Date(pago.fecha_pago).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Recibo SETAR ${pago.referencia}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      background: #f5f5f5;
      margin: 0;
    }
    .recibo {
      max-width: 700px;
      margin: 0 auto;
      background: #fff;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #8B0000;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 40px;
    }
    .empresa {
      text-align: right;
    }
    .empresa h1 {
      color: #8B0000;
      margin: 0;
      font-size: 22px;
    }
    .empresa p {
      color: #666;
      margin: 4px 0;
      font-size: 12px;
    }
    h2 {
      color: #0D47A1;
      text-align: center;
      margin: 30px 0;
      font-size: 20px;
      letter-spacing: 2px;
    }
    .info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 30px;
    }
    .info-item {
      padding: 12px;
      background: #f9f9f9;
      border-radius: 8px;
    }
    .info-item label {
      font-size: 11px;
      color: #888;
      font-weight: 600;
      text-transform: uppercase;
      display: block;
      margin-bottom: 4px;
    }
    .info-item value {
      font-size: 14px;
      color: #333;
      font-weight: 600;
    }
    .monto-box {
      background: #0D47A1;
      color: #fff;
      padding: 30px;
      border-radius: 12px;
      text-align: center;
      margin: 30px 0;
    }
    .monto-box label {
      font-size: 12px;
      letter-spacing: 2px;
      opacity: 0.9;
    }
    .monto-box .monto {
      font-size: 48px;
      font-weight: bold;
      margin-top: 8px;
    }
    .monto-box .moneda {
      font-size: 24px;
    }
    .detalle {
      margin-bottom: 30px;
    }
    .detalle h3 {
      color: #333;
      font-size: 15px;
      margin-bottom: 15px;
      border-bottom: 2px solid #eee;
      padding-bottom: 8px;
    }
    .detalle-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #f5f5f5;
    }
    .detalle-row span:first-child {
      color: #666;
      font-size: 13px;
    }
    .detalle-row span:last-child {
      color: #333;
      font-weight: 600;
      font-size: 13px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #eee;
      text-align: center;
      color: #999;
      font-size: 11px;
    }
    .sello {
      background: #43A047;
      color: #fff;
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: bold;
      display: inline-block;
      margin: 20px auto;
      font-size: 13px;
    }
    .btn-container {
      text-align: center;
      margin-top: 30px;
    }
    .btn {
      background: #0D47A1;
      color: #fff;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      margin: 0 5px;
      font-weight: bold;
    }
    .btn:hover {
      background: #0a3a7d;
    }
    .btn-print {
      background: #43A047;
    }
    .btn-print:hover {
      background: #2E7D32;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .recibo { box-shadow: none; padding: 20px; }
      .btn-container { display: none; }
    }
  </style>
</head>
<body>
  <div class="recibo">
    <div class="header">
      <div class="logo">⚡</div>
      <div class="empresa">
        <h1>SETAR YACUIBA</h1>
        <p>Servicios Eléctricos Tarija</p>
        <p>Regional Yacuiba - Bolivia</p>
        <p>NIT: 1023456789</p>
      </div>
    </div>

    <h2>RECIBO DE PAGO</h2>

    <div class="info">
      <div class="info-item">
        <label>N° Recibo</label>
        <value>${pago.referencia}</value>
      </div>
      <div class="info-item">
        <label>Fecha de pago</label>
        <value>${fecha}</value>
      </div>
      <div class="info-item">
        <label>Cliente</label>
        <value>${pago.nombre}</value>
      </div>
      <div class="info-item">
        <label>CI/NIT</label>
        <value>${pago.ci_nit}</value>
      </div>
      <div class="info-item">
        <label>Medidor</label>
        <value>${pago.codigo_medidor || 'N/A'}</value>
      </div>
      <div class="info-item">
        <label>Dirección</label>
        <value>${pago.direccion}</value>
      </div>
    </div>

    <div class="monto-box">
      <label>MONTO PAGADO</label>
      <div class="monto"><span class="moneda">Bs</span> ${parseFloat(pago.monto).toFixed(2)}</div>
    </div>

    <div class="detalle">
      <h3>Detalle del pago</h3>
      <div class="detalle-row">
        <span>Método de pago</span>
        <span>${pago.metodo}</span>
      </div>
      <div class="detalle-row">
        <span>Estado</span>
        <span>${pago.estado.toUpperCase()}</span>
      </div>
      <div class="detalle-row">
        <span>Período</span>
        <span>${pago.periodo || new Date(pago.fecha_pago).toLocaleDateString('es-BO', { month: 'long', year: 'numeric' })}</span>
      </div>
      <div class="detalle-row">
        <span>Referencia</span>
        <span>${pago.referencia}</span>
      </div>
    </div>

    <div style="text-align: center;">
      <div class="sello"> PAGO CONFIRMADO</div>
    </div>

    <div class="footer">
      <p>Este documento es un comprobante oficial de pago emitido por SETAR Yacuiba.</p>
      <p>Para consultas: +591 4 682-1234 | info@setar.gob.bo</p>
      <p>Gracias por su pago puntual.</p>
    </div>

    <div class="btn-container">
      <button class="btn" onclick="window.print()"> Imprimir</button>
      <button class="btn btn-print" onclick="descargarPDF()"> Descargar PDF</button>
    </div>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
  <script>
    function descargarPDF() {
      const element = document.querySelector('.recibo');
      const opt = {
        margin: 10,
        filename: 'recibo_${pago.referencia}.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(element).save();
    }
  </script>
</body>
</html>
  `;
}

exports.generarHTMLRecibo = generarHTMLRecibo;