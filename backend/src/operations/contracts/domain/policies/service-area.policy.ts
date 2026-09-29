import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';
import type {
  IOperationalBoundingBox,
  IServiceArea,
} from '../types/service-area.types';
import { MANGLARALTO_BOUNDARY } from '../constants/manglaralto-boundary.constant';

export const SERVICE_AREA: IServiceArea = {
  nombre: 'Parroquia Manglaralto',
  fuente: 'OpenStreetMap (relation 278708), ODbL',
  geometria: MANGLARALTO_BOUNDARY,
};

export const OPERATIONAL_BOUNDING_BOX: IOperationalBoundingBox = {
  nombre: 'Provincia de Santa Elena',
  minLongitud: -81.008,
  minLatitud: -2.508,
  maxLongitud: -80.2,
  maxLatitud: -1.668,
};

export const OUTSIDE_OPERATIONAL_AREA_MESSAGE =
  'La ubicación está fuera del área de operación territorial (provincia de Santa Elena)';

export const OUTSIDE_SERVICE_AREA_MESSAGE =
  'La ubicación seleccionada está fuera del área de servicio de la Junta (parroquia Manglaralto)';

export function isWithinOperationalBoundingBox(
  latitud: number,
  longitud: number,
): boolean {
  const { minLongitud, minLatitud, maxLongitud, maxLatitud } =
    OPERATIONAL_BOUNDING_BOX;
  return (
    latitud >= minLatitud &&
    latitud <= maxLatitud &&
    longitud >= minLongitud &&
    longitud <= maxLongitud
  );
}

export function isWithinServiceArea(
  latitud: number,
  longitud: number,
): boolean {
  return booleanPointInPolygon([longitud, latitud], SERVICE_AREA.geometria);
}

export function validateServiceAreaLocation(
  latitud: number,
  longitud: number,
): string | null {
  if (!isWithinOperationalBoundingBox(latitud, longitud)) {
    return OUTSIDE_OPERATIONAL_AREA_MESSAGE;
  }
  if (!isWithinServiceArea(latitud, longitud)) {
    return OUTSIDE_SERVICE_AREA_MESSAGE;
  }
  return null;
}
