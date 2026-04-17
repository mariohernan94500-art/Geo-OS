/**
 * Generador de token JWT para Voren / API
 * Ejecutar: node scripts/gen-token.js
 */
const jwt    = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'llave-secreta-temporal-cambiar-en-produccion';
const uid    = process.env.USER_UID   || '94246835';

if (secret === 'llave-secreta-temporal-cambiar-en-produccion') {
  console.warn('⚠️  Estás usando el JWT_SECRET por defecto.');
  console.warn('   Agrega JWT_SECRET=tu_clave_segura al .env antes de producción.\n');
}

const token = jwt.sign(
  { uid, role: 'OWNER', isActive: true },
  secret,
  { expiresIn: '30d' }
);

console.log('✅ Token generado (válido 30 días):');
console.log('\n' + token + '\n');
console.log('📋 Cópialo en Voren > Configuración > Token JWT');
console.log('   o en VOREN_TOKEN dentro de tu .env\n');
