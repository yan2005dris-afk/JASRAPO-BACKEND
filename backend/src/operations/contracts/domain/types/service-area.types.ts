import type { Polygon } from 'geojson';

export interface IServiceArea {
  nombre: string;
  fuente: string;
  geometria: Polygon;
}

export interface IOperationalBoundingBox {
  nombre: string;
  minLongitud: number;
  minLatitud: number;
  maxLongitud: number;
  maxLatitud: number;
}
