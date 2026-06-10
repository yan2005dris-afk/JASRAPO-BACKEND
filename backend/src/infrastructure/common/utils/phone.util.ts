import { BadRequestException } from '@nestjs/common';

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

/**
 * Utilitario para validación de números de teléfono
 * Ecuador: +593 (código país) o 09 (código de telefonía móvil)
 */
export class PhoneUtil {
  /**
   * Valida número de teléfono ecuatoriano
   * Formatos aceptados:
   * - +593 9XX XXX XXXX (9 dígitos después de +593)
   * - 09X XXXX XXXX (10 dígitos)
   * - 09XXXXXXXX (10 dígitos sin espacios)
   *
   * @param phone - Número de teléfono a validar
   * @param fieldName - Nombre del campo para el mensaje de error
   * @throws BadRequestException si el teléfono no es válido
   */
  static validateEcuadorian(phone: string, fieldName: string): void {
    if (!phone || phone.trim().length === 0) {
      throw new BadRequestException(
        `El campo ${fieldName} no puede estar vacío`,
      );
    }

    // Limpiar espacios y guiones
    const cleaned = phone.replace(/[\s-]/g, '');

    // Verificar formato +593
    if (cleaned.startsWith('+593')) {
      const numberPart = cleaned.substring(4); // Quitar +593
      if (numberPart.length !== 9) {
        throw new BadRequestException(
          `El campo ${fieldName} debe tener 9 dígitos después de +593`,
        );
      }
      if (!/^9\d{8}$/.test(numberPart)) {
        throw new BadRequestException(
          `El campo ${fieldName} debe comenzar con 9 (prefijo móvil) después de +593`,
        );
      }
      return;
    }

    // Verificar formato 09 (celular ecuatoriano)
    if (cleaned.startsWith('09')) {
      if (cleaned.length !== 10) {
        throw new BadRequestException(
          `El campo ${fieldName} debe tener exactamente 10 dígitos`,
        );
      }
      if (!/^09\d{8}$/.test(cleaned)) {
        throw new BadRequestException(
          `El campo ${fieldName} debe comenzar con 09 seguido de 8 dígitos`,
        );
      }
      return;
    }

    // Si no empieza con +593 ni 09, rechazar
    throw new BadRequestException(
      `El campo ${fieldName} debe comenzar con +593 o 09`,
    );
  }

  /**
   * Valida y retorna el teléfono limpio (sin espacios)
   * @param phone - Número de teléfono
   * @param fieldName - Nombre del campo
   * @returns Teléfono limpio
   */
  static validateAndClean(phone: string, fieldName: string): string {
    PhoneUtil.validateEcuadorian(phone, fieldName);
    return phone.replace(/[\s-]/g, '');
  }
}

