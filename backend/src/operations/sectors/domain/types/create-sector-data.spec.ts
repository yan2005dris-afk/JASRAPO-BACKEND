import { CreateSectorData } from './create-sector-data';

describe('CreateSectorData', () => {
  it('should accept valid create data', () => {
    const data: CreateSectorData = {
      nombre: 'Sector Norte',
      codigo: 'SN-001',
      comunidadId: 10,
    };

    expect(data.nombre).toBe('Sector Norte');
    expect(data.codigo).toBe('SN-001');
    expect(data.comunidadId).toBe(10);
  });

  it('should enforce required fields', () => {
    const data: CreateSectorData = {
      nombre: 'Test',
      codigo: 'T-001',
      comunidadId: 1,
    };

    // Verify structural type - all required fields present
    expect(Object.keys(data).sort()).toEqual(['codigo', 'comunidadId', 'nombre']);
  });
});
