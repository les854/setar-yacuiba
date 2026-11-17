// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'setar_yacuiba_secret_2026';

module.exports = (req, res, next) => {
  try {
    // Leer el header Authorization
    const authHeader = req.headers.authorization;
    console.log(' Auth header:', authHeader ? 'Presente' : 'Ausente');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(' No hay token Bearer');
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    console.log(' Token recibido (primeros 20):', token.substring(0, 20) + '...');

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(' Token válido:', decoded);

    req.tecnico = decoded;
    req.user = decoded;
    next();
  } catch (error) {
    console.log(' Error verificando token:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido' });
    }
    return res.status(401).json({ message: 'No autorizado', detalle: error.message });
  }
};