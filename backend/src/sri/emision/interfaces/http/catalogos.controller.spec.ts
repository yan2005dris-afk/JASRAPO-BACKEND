import 'reflect-metadata';
import { CatalogosController } from './catalogos.controller';

describe('CatalogosController', () => {
  it('protects the endpoints with catalogos read permission', () => {
    const metadata = Reflect.getMetadata('permission', CatalogosController);
    expect(metadata).toEqual({ recurso: 'catalogos', accion: 'read' });
  });

  it('maps to the standardized sri/catalogs route prefix', () => {
    const path = Reflect.getMetadata('path', CatalogosController);
    expect(path).toBe('sri/catalogs');
  });
});
