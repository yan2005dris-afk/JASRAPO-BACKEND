import 'reflect-metadata';
import { CollectionCutoffController } from './collection-cutoff.controller';

describe('CollectionCutoffController', () => {
  it('protects the operator endpoint with report read permission', () => {
    const metadata = Reflect.getMetadata(
      'permission',
      CollectionCutoffController.prototype.getCandidates,
    );
    expect(metadata).toEqual({ recurso: 'reportes', accion: 'read' });
  });
});
