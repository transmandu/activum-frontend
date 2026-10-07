// src/utils/validaciones.js

/**
 * ============================================================
 * FUNCIONES DE FORMATEO Y VALIDACIÓN PARA EL SISTEMA
 * ============================================================
 */

// ============================================================
// 1. MAC (Dirección física)
// ============================================================

/**
 * Formatea automáticamente una dirección MAC mientras el usuario escribe
 * - Convierte a mayúsculas
 * - Inserta guiones cada 2 caracteres
 * - Limita a 12 caracteres hexadecimales
 * - Ejemplo: 1866da4b23d1 → 18-66-DA-4B-23-D1
 */
export const formatearMAC = (valor) => {
  if (!valor) return '';
  
  // Eliminar cualquier carácter que no sea hexadecimal (0-9, A-F, a-f)
  let hex = valor.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
  
  // Limitar a 12 caracteres
  hex = hex.slice(0, 12);
  
  // Insertar guiones cada 2 caracteres
  if (hex.length === 0) return '';
  if (hex.length <= 2) return hex;
  
  let formateado = '';
  for (let i = 0; i < hex.length; i++) {
    if (i > 0 && i % 2 === 0) {
      formateado += '-';
    }
    formateado += hex[i];
  }
  
  return formateado;
};

/**
 * Valida una dirección MAC
 * - Permite formato con guiones automáticos
 * - Máximo 12 caracteres hexadecimales sin contar guiones
 * - Ejemplo válido: 18-66-DA-4B-23-D1
 */
export const validarMAC = (mac) => {
  if (!mac || mac.trim() === '') return { valido: true, mensaje: '' };
  
  const macLimpia = mac.replace(/-/g, '');
  
  // Verificar que solo tenga caracteres hexadecimales
  const hexRegex = /^[0-9A-F]{1,12}$/i;
  if (!hexRegex.test(macLimpia)) {
    return { valido: false, mensaje: 'La MAC solo puede contener caracteres hexadecimales (0-9, A-F)' };
  }
  
  // Verificar longitud máxima
  if (macLimpia.length > 12) {
    return { valido: false, mensaje: 'La MAC no puede tener más de 12 caracteres hexadecimales' };
  }
  
  // Verificar longitud mínima (opcional, 12 es lo esperado, pero permitimos menos durante escritura)
  if (macLimpia.length < 12) {
    return { valido: false, mensaje: `MAC incompleta (${macLimpia.length}/12 caracteres)` };
  }
  
  // Verificar formato con guiones (debe tener 5 guiones si tiene 12 caracteres)
  if (mac.includes('-') && mac.split('-').length !== 6) {
    return { valido: false, mensaje: 'Formato MAC inválido. Use XX-XX-XX-XX-XX-XX' };
  }
  
  return { valido: true, mensaje: '' };
};

// ============================================================
// 2. IP (Dirección de red)
// ============================================================

/**
 * Valida una dirección IP (IPv4 o IPv6)
 * - IPv4: 192.168.0.145 (máximo 15 caracteres)
 * - IPv6: formato estándar
 * - Permite vacío (nulleable)
 */
export const validarIP = (ip) => {
  if (!ip || ip.trim() === '') return { valido: true, mensaje: '' };
  
  const ipLimpia = ip.trim();
  
  // Intentar validar como IPv4
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ipLimpia)) {
    const partes = ipLimpia.split('.');
    for (const parte of partes) {
      const num = parseInt(parte, 10);
      if (num < 0 || num > 255) {
        return { valido: false, mensaje: 'Cada octeto de la IPv4 debe estar entre 0 y 255' };
      }
    }
    return { valido: true, mensaje: '' };
  }
  
  // Intentar validar como IPv6 (formato básico)
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  if (ipv6Regex.test(ipLimpia)) {
    return { valido: true, mensaje: '' };
  }
  
  // IPv6 abreviado (con ::)
  const ipv6AbvRegex = /^([0-9a-fA-F]{1,4}:){0,6}(:[0-9a-fA-F]{1,4}){0,6}$/;
  if (ipLimpia.includes('::') && ipv6AbvRegex.test(ipLimpia.replace(/::/g, ':'))) {
    return { valido: true, mensaje: '' };
  }
  
  return { valido: false, mensaje: 'Formato de IP inválido. Use IPv4 (192.168.0.1) o IPv6' };
};

// ============================================================
// 3. Email (Correo electrónico)
// ============================================================

/**
 * Valida un correo electrónico
 * - Debe contener @ y un dominio con punto
 * - No permite caracteres extraños
 */
export const validarEmail = (email) => {
  if (!email || email.trim() === '') return { valido: false, mensaje: 'El correo electrónico es obligatorio' };
  
  const emailLimpio = email.trim();
  
  // Verificar que tenga @
  if (!emailLimpio.includes('@')) {
    return { valido: false, mensaje: 'El correo debe contener @' };
  }
  
  // Verificar que tenga un punto en el dominio
  const partes = emailLimpio.split('@');
  if (partes.length !== 2) {
    return { valido: false, mensaje: 'Formato de correo inválido' };
  }
  
  const dominio = partes[1];
  if (!dominio.includes('.')) {
    return { valido: false, mensaje: 'El dominio del correo debe contener un punto (ej: .com, .org)' };
  }
  
  // Verificar que el dominio no tenga caracteres extraños (solo letras, números, guiones y puntos)
  const dominioRegex = /^[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,}$/;
  if (!dominioRegex.test(dominio)) {
    return { valido: false, mensaje: 'El dominio del correo tiene un formato inválido' };
  }
  
  // Verificar que el nombre de usuario no tenga caracteres extraños
  const usuario = partes[0];
  const usuarioRegex = /^[a-zA-Z0-9._%+-]+$/;
  if (!usuarioRegex.test(usuario)) {
    return { valido: false, mensaje: 'El nombre de usuario contiene caracteres no permitidos' };
  }
  
  return { valido: true, mensaje: '' };
};

// ============================================================
// 4. Cédula (Venezolana)
// ============================================================

/**
 * Formatea un número con puntos de miles (desde la derecha)
 * Ej: 33158392 → 33.158.392
 * Ej: 9265193 → 9.265.193
 */
const formatearConPuntos = (numero) => {
  if (!numero) return '';
  const str = numero.toString();
  let resultado = '';
  let contador = 0;
  for (let i = str.length - 1; i >= 0; i--) {
    resultado = str[i] + resultado;
    contador++;
    if (contador % 3 === 0 && i > 0) {
      resultado = '.' + resultado;
    }
  }
  return resultado;
};

/**
 * Formatea una cédula automáticamente mientras el usuario escribe
 * - V-33158392 → V-33.158.392
 * - V-9265193 → V-9.265.193
 * - Máximo 8 dígitos
 */
export const formatearCedula = (valor) => {
  if (!valor) return 'V-';
  
  // Extraer los números después de V-
  let numeros = valor.replace(/^[Vv]-/, '').replace(/\./g, '');
  if (numeros.length === 0) return 'V-';
  
  // Limitar a 8 dígitos
  numeros = numeros.slice(0, 8);
  
  // Si solo hay números, aplicar formato de miles
  const formateado = formatearConPuntos(numeros);
  return `V-${formateado}`;
};

/**
 * Valida una cédula venezolana
 * - Debe comenzar con V-
 * - Debe tener entre 6 y 8 dígitos después de V-
 * - Solo números después de V-
 * - Ejemplo válido: V-33.158.392 o V-9.265.193
 */
export const validarCedula = (cedula) => {
  if (!cedula || cedula.trim() === '') {
    return { valido: false, mensaje: 'La cédula es obligatoria' };
  }
  
  const cedulaLimpia = cedula.trim();
  
  // Verificar que comience con V- (case insensitive)
  if (!cedulaLimpia.match(/^[Vv]-/)) {
    return { valido: false, mensaje: 'La cédula debe comenzar con V-' };
  }
  
  // Extraer solo los números después de V-
  const numeros = cedulaLimpia.replace(/^[Vv]-/, '').replace(/\./g, '');
  
  // Verificar que solo tenga números
  if (!/^\d+$/.test(numeros)) {
    return { valido: false, mensaje: 'La cédula solo debe contener números después de V-' };
  }
  
  // Verificar longitud (mínimo 6, máximo 8 dígitos)
  if (numeros.length < 6) {
    return { valido: false, mensaje: 'La cédula debe tener al menos 6 dígitos' };
  }
  if (numeros.length > 8) {
    return { valido: false, mensaje: 'La cédula no puede tener más de 8 dígitos' };
  }
  
  return { valido: true, mensaje: '' };
};

// ============================================================
// 5. RIF (Venezolano)
// ============================================================

/**
 * Formatea un RIF automáticamente mientras el usuario escribe
 * - J-12345678 → J-12345678 (sin puntos)
 * - Máximo 10 dígitos después de J-
 */
export const formatearRIF = (valor) => {
  if (!valor) return 'J-';
  
  // Extraer los números después de J-
  let numeros = valor.replace(/^[Jj]-/, '').replace(/[^0-9]/g, '');
  if (numeros.length === 0) return 'J-';
  
  // Limitar a 10 dígitos (según normativa de RIF en Venezuela)
  numeros = numeros.slice(0, 10);
  
  return `J-${numeros}`;
};

/**
 * Valida un RIF venezolano
 * - Debe comenzar con J-
 * - Debe tener entre 8 y 10 dígitos después de J-
 * - Solo números después de J-
 * - Ejemplo válido: J-12345678 o J-1234567890
 */
export const validarRIF = (rif) => {
  if (!rif || rif.trim() === '') {
    return { valido: false, mensaje: 'El RIF es obligatorio' };
  }
  
  const rifLimpio = rif.trim();
  
  // Verificar que comience con J- (case insensitive)
  if (!rifLimpio.match(/^[Jj]-/)) {
    return { valido: false, mensaje: 'El RIF debe comenzar con J-' };
  }
  
  // Extraer solo los números después de J-
  const numeros = rifLimpio.replace(/^[Jj]-/, '').replace(/[^0-9]/g, '');
  
  // Verificar que solo tenga números
  if (!/^\d+$/.test(numeros)) {
    return { valido: false, mensaje: 'El RIF solo debe contener números después de J-' };
  }
  
  // Verificar longitud (mínimo 8, máximo 10 dígitos)
  if (numeros.length < 8) {
    return { valido: false, mensaje: 'El RIF debe tener al menos 8 dígitos' };
  }
  if (numeros.length > 10) {
    return { valido: false, mensaje: 'El RIF no puede tener más de 10 dígitos' };
  }
  
  return { valido: true, mensaje: '' };
};

// ============================================================
// 6. Teléfono (Internacional)
// ============================================================

/**
 * Formatea un número de teléfono para mostrar con prefijo
 * - Venezuela: +58 4149261158
 * - Estados Unidos: +1 1234567890
 * - Si el número está vacío, devuelve ''
 */
export const formatearTelefono = (numero, pais = 'VE') => {
  if (!numero) return '';
  // Limpiar cualquier carácter no numérico
  const numeros = numero.replace(/\D/g, '');
  if (numeros.length === 0) return '';
  
  const prefijos = {
    'VE': '+58',
    'US': '+1',
    'CO': '+57',
    'MX': '+52',
    'AR': '+54',
    'CL': '+56',
    'PE': '+51',
    'EC': '+593',
    'ES': '+34',
  };
  
  const prefijo = prefijos[pais] || '+';
  return `${prefijo} ${numeros}`;
};

/**
 * Obtiene solo los dígitos de un teléfono (para guardar en BD)
 */
export const limpiarTelefono = (telefono) => {
  if (!telefono) return '';
  return telefono.replace(/\D/g, '');
};

/**
 * Valida un número de teléfono según el país
 * - Venezuela: acepta 10 dígitos (sin 0 inicial) o 11 dígitos (con 0)
 * - Estados Unidos: 10 dígitos
 * - Otros países: validación genérica
 */
export const validarTelefono = (telefono, pais = 'VE') => {
  if (!telefono || telefono.trim() === '') return { valido: true, mensaje: '' };
  
  // Limpiar todo lo que no sea número
  const digitos = telefono.replace(/\D/g, '');
  
  // Si no hay dígitos, no es válido (pero permitimos vacío)
  if (digitos.length === 0) return { valido: true, mensaje: '' };
  
  // Validar según el país
  switch (pais) {
    case 'VE': // Venezuela - acepta 10 o 11 dígitos
      if (digitos.length !== 10 && digitos.length !== 11) {
        return { 
          valido: false, 
          mensaje: `El teléfono venezolano debe tener 10 dígitos (sin el 0 inicial) o 11 dígitos (con 0). Tiene ${digitos.length}` 
        };
      }
      // Si tiene 11 dígitos, debe empezar con 0
      if (digitos.length === 11 && !digitos.startsWith('0')) {
        return { valido: false, mensaje: 'El teléfono con 11 dígitos debe empezar con 0' };
      }
      // Si tiene 10 dígitos, no debe empezar con 0
      if (digitos.length === 10 && digitos.startsWith('0')) {
        return { valido: false, mensaje: 'El teléfono con 10 dígitos no debe empezar con 0' };
      }
      // Verificar que el código de área comience con 2-9
      if (digitos.length === 10) {
        const area = digitos.slice(0, 3);
        if (area[0] < '2' || area[0] > '9') {
          return { valido: false, mensaje: 'El código de área venezolano debe comenzar con un dígito entre 2 y 9' };
        }
      }
      break;
    case 'US': // Estados Unidos
      if (digitos.length !== 10) {
        return { 
          valido: false, 
          mensaje: `El teléfono de EE.UU. debe tener 10 dígitos (tiene ${digitos.length})` 
        };
      }
      break;
    default:
      // Validación genérica: entre 7 y 15 dígitos
      if (digitos.length < 7 || digitos.length > 15) {
        return { valido: false, mensaje: 'El número debe tener entre 7 y 15 dígitos' };
      }
  }
  
  return { valido: true, mensaje: '' };
};

// ============================================================
// 7. Lista de países para selector de teléfono
// ============================================================

export const paisesTelefono = [
  { codigo: 'VE', nombre: 'Venezuela', prefijo: '+58' },
  { codigo: 'US', nombre: 'Estados Unidos', prefijo: '+1' },
  { codigo: 'CO', nombre: 'Colombia', prefijo: '+57' },
  { codigo: 'MX', nombre: 'México', prefijo: '+52' },
  { codigo: 'AR', nombre: 'Argentina', prefijo: '+54' },
  { codigo: 'CL', nombre: 'Chile', prefijo: '+56' },
  { codigo: 'PE', nombre: 'Perú', prefijo: '+51' },
  { codigo: 'EC', nombre: 'Ecuador', prefijo: '+593' },
  { codigo: 'ES', nombre: 'España', prefijo: '+34' },
];