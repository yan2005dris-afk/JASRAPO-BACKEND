import type { UpdateSectorData } from './update-sector-data';

describe('UpdateSectorData', () => {
  it('should allow partial sector update', () => {
    const data: UpdateSectorData = { nombre: 'Nuevo Nombre' };

    expect(data.nombre).toBe('Nuevo Nombre');
    expect(Object.keys(data)).toEqual(['nombre']);
  });

  it('should allow updating all fields', () => {
    const data: UpdateSectorData = {
      nombre: 'Nuevo',
      codigo: 'N-001',
      comunidadId: 5,
    };

    expect(data.nombre).toBe('Nuevo');
    expect(data.codigo).toBe('N-001');
    expect(data.comunidadId).toBe(5);
  });
});
