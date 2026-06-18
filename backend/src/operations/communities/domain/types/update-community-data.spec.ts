import type { UpdateCommunityData } from './update-community-data';

describe('UpdateCommunityData', () => {
  it('should accept a partial update payload', () => {
    const data: UpdateCommunityData = {
      nombre: 'Updated Name',
    };

    expect(data.nombre).toBe('Updated Name');
  });
});
