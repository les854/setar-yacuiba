// backend/src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const tecnicoRoutes = require('./routes/tecnicoRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const medidorRoutes = require('./routes/medidorRoutes');
const lecturaRoutes = require('./routes/lecturaRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const tareaRoutes = require('./routes/tareaRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

require('./db');

const app = express();

//  Seguridad
app.use(helmet({ contentSecurityPolicy: false }));

//  CORS - permitir peticiones de la app móvil
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

//  Body parser - IMPORTANTE: subir el límite a 10mb para fotos base64
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

//  Servir archivos estáticos (fotos de medidores)
// Esto permite acceder a las fotos con: http://tu-ip:4000/uploads/foto.jpg
const uploadsPath = path.join(__dirname, '../uploads');

// Crear carpeta uploads si no existe
const fs = require('fs');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log(' Carpeta uploads creada');
}

app.use('/uploads', express.static(uploadsPath));

// ============================================
// Swagger / OpenAPI
// ============================================
const openApiSpec = YAML.load(path.join(__dirname, '../openapi.yaml'));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
  customSiteTitle: 'SETAR Yacuiba - Geolocalización de Medidores API',
  customCss: '.swagger-ui .topbar { display: none }',
}));
app.get('/api/docs/openapi.yaml', (_req, res) => {
  res.sendFile(path.join(__dirname, '../openapi.yaml'));
});

// ============================================
// Health check
// ============================================
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'SETAR Yacuiba API',
    ts: new Date().toISOString(),
  });
});

// ============================================
// Rutas de la API
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/tecnicos', tecnicoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/medidores', medidorRoutes);
app.use('/api/lecturas', lecturaRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/tareas', tareaRoutes);

// ============================================
// Middleware de errores (SIEMPRE al final)
// ============================================
app.use(notFound);
app.use(errorHandler);

module.exports = app;