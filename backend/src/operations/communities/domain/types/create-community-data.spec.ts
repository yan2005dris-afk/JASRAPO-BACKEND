import type { CreateCommunityData } from './create-community-data';

describe('CreateCommunityData', () => {
  it('should accept a valid create payload', () => {
    const data: CreateCommunityData = {
      nombre: 'Test Community',
      codigo: 'TC-001',
      porcentajeTasaSeguridad: 5,
    };

    expect(data.nombre).toBe('Test Community');
    expect(data.codigo).toBe('TC-001');
    expect(data.porcentajeTasaSeguridad).toBe(5);
  });
});
