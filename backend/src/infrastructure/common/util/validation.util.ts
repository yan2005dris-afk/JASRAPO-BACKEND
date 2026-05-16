/**
 * Utilidades comunes de validación
 */

/**
 * Valida que un string no esté vacío o sea solo espacios/quotes
 * Evita que se acepten valores como: "", "  ", '""', "''"
 */
export function isNotEmptyString(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();
  
  // Verificar que no esté vacío
  if (trimmed.length === 0) {
    return false;
  }

  // Verificar que no sea solo comillas
  if (trimmed === '""' || trimmed === "''") {
    return false;
  }

  return true;
}

/**
 * Valida que un string no sea null, undefined, vacío o solo espacios
 */
export function isValidString(value: string): boolean {
  return isNotEmptyString(value);
}

/**
 * Limpia un string removiendo espacios extras y comillas innecesarias
 */
export function cleanString(value: string): string {
  if (!value || typeof value !== 'string') {
    return '';
  }

  let cleaned = value.trim();
  
  // Remover comillas dobles si envuelven todo el string
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }
  
  // Remover comillas simples si envuelven todo el string
  if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
    cleaned = cleaned.slice(1, -1);
  }

  return cleaned.trim();
}

/**
 * Valida que un número sea positivo
 */
export function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && value > 0;
}

/**
 * Valida que un valor no sea null o undefined
 */
export function isNotNull<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}
