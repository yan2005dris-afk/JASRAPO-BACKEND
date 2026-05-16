/**
 * Utilidades para validación y formateo de números de teléfono
 */

/**
 * Valida si un número de teléfono ecuatoriano es válido
 * Formatos aceptados:
 * - +593 XXX XXX XXXX
 * - 0XX XXX XXXX
 * - XXX XXX XXXX
 */
export function isValidEcuadorPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Eliminar espacios y caracteres especiales
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Validar formato ecuatoriano
  const ecuadorPhoneRegex = /^(\+593|0)?[2-9]\d{8}$/;
  return ecuadorPhoneRegex.test(cleaned);
}

/**
 * Normaliza un número de teléfono al formato +593 XXX XXX XXXX
 */
export function normalizeEcuadorPhone(phone: string): string {
  if (!phone) {
    return '';
  }

  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Si ya tiene el código de país
  if (cleaned.startsWith('+593')) {
    return cleaned;
  }

  // Si empieza con 0, reemplazar por +593
  if (cleaned.startsWith('0')) {
    return '+593' + cleaned.substring(1);
  }

  // Si no tiene código, asumir ecuatoriano y agregar +593
  return '+593' + cleaned;
}

/**
 * Valida que el campo de teléfono no esté vacío o sea solo espacios
 */
export function isNotEmptyPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  return phone.trim().length > 0;
}
