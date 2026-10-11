/**
 * Canonical shape for the activity-types catalog exposed at
 * `GET /work-orders/activity-types`. This is the single source of truth
 * across work-orders, routes and operator consumers.
 */
export interface TipoActividad {
  tipoActividadId: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  icono: string | null;
  activo: boolean;
}
