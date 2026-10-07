import {
  isWithinOperationalBoundingBox,
  isWithinServiceArea,
  OUTSIDE_OPERATIONAL_AREA_MESSAGE,
  OUTSIDE_SERVICE_AREA_MESSAGE,
  SERVICE_AREA,
  validateServiceAreaLocation,
} from './service-area.policy';

describe('ServiceArea', () => {
  it('exposes the Manglaralto boundary as a closed GeoJSON polygon', () => {
    const [ring] = SERVICE_AREA.geometria.coordinates;

    expect(SERVICE_AREA.geometria.type).toBe('Polygon');
    expect(ring).toHaveLength(1099);
    expect(ring[0]).toEqual(ring[ring.length - 1]);
  });

  it.each([
    ['Olón', -1.7982, -80.7582],
    ['Curía', -1.7747, -80.7643],
    ['San José', -1.7597, -80.7691],
    ['Las Núñez', -1.7425, -80.776],
    ['La Entrada', -1.7318, -80.7834],
  ])('accepts a point in %s', (_, latitud, longitud) => {
    expect(isWithinServiceArea(latitud, longitud)).toBe(true);
  });

  it.each([
    ['the open sea', -1.8, -80.8],
    ['Ayangue', -1.978, -80.755],
  ])('rejects a point in %s', (_, latitud, longitud) => {
    expect(isWithinServiceArea(latitud, longitud)).toBe(false);
  });

  it('treats a boundary vertex as inside the service area', () => {
    const [longitud, latitud] = SERVICE_AREA.geometria.coordinates[0][10];

    expect(isWithinServiceArea(latitud, longitud)).toBe(true);
  });
});

describe('OperationalBoundingBox', () => {
  it('contains every vertex of the service area', () => {
    const [ring] = SERVICE_AREA.geometria.coordinates;

    expect(
      ring.every(([longitud, latitud]) =>
        isWithinOperationalBoundingBox(latitud, longitud),
      ),
    ).toBe(true);
  });

  it('includes its own corners', () => {
    expect(isWithinOperationalBoundingBox(-2.508, -81.008)).toBe(true);
    expect(isWithinOperationalBoundingBox(-1.668, -80.2)).toBe(true);
  });

  it.each([
    ['just north', -1.6679, -80.7],
    ['just south', -2.5081, -80.7],
    ['just west', -2, -81.0081],
    ['just east', -2, -80.1999],
  ])('rejects a point %s of the box', (_, latitud, longitud) => {
    expect(isWithinOperationalBoundingBox(latitud, longitud)).toBe(false);
  });
});

describe('validateServiceAreaLocation', () => {
  it('reports a point outside the province as outside the operational area', () => {
    expect(validateServiceAreaLocation(-0.2, -78.5)).toBe(
      OUTSIDE_OPERATIONAL_AREA_MESSAGE,
    );
  });

  it('reports a point inside the province but outside the service area', () => {
    expect(validateServiceAreaLocation(-1.8, -80.8)).toBe(
      OUTSIDE_SERVICE_AREA_MESSAGE,
    );
  });

  it('accepts a point in Olón', () => {
    expect(validateServiceAreaLocation(-1.7982, -80.7582)).toBeNull();
  });
});
