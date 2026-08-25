/**
 * Tipo de dato JSON válido (discriminated union).
 *
 * Sustituye a `any` en puertos de dominio donde el valor es JSON
 * arbitrario (ej: payloads de webhooks, columnas JSON en Prisma).
 *
 * Inspirado en `Json` de `type-fest` pero reducido a lo que el proyecto
 * necesita. Mantenerlo acá, no en un paquete externo, evita sumar una
 * dependencia y deja el contrato visible para revisiones de tipo.
 */
export type JsonPrimitive = string | number | boolean | null;

export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };
