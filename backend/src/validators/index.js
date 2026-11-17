const { body, param, validationResult } = require('express-validator');

// Middleware para validar resultados
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ===================== AUTH =====================
const registerValidator = [
  body('nombre').notEmpty().withMessage('Nombre requerido'),
  body('apellido').notEmpty().withMessage('Apellido requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
  body('rol').isIn(['admin','tecnico','consulta']).withMessage('Rol inválido'),
  validate,
];

const loginValidator = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Contraseña requerida'),
  validate,
];

// ===================== USUARIOS =====================
const usuarioValidator = [
  body('nombre').optional().notEmpty(),
  body('apellido').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('rol').optional().isIn(['admin','tecnico','consulta']),
  validate,
];

// ===================== TECNICOS =====================
const tecnicoValidator = [
  body('usuario_id').isInt().withMessage('usuario_id debe ser entero'),
  body('codigo_tecnico').notEmpty().withMessage('Código técnico requerido'),
  validate,
];

// ===================== CLIENTES =====================
const clienteValidator = [
  body('nombre').notEmpty().withMessage('Nombre requerido'),
  body('apellido').notEmpty().withMessage('Apellido requerido'),
  body('ci').optional().notEmpty(),
  validate,
];

// ===================== MEDIDORES =====================
const medidorValidator = [
  body('codigo_medidor').notEmpty().withMessage('Código requerido'),
  body('numero_serie').notEmpty().withMessage('Número de serie requerido'),
  body('estado').optional().isIn(['instalado','retirado','dañado','no_localizado','mantenimiento']),
  validate,
];

const idParam = [
  param('id').isInt().withMessage('ID debe ser entero'),
  validate,
];

module.exports = {
  registerValidator,
  loginValidator,
  usuarioValidator,
  tecnicoValidator,
  clienteValidator,
  medidorValidator,
  idParam,
};