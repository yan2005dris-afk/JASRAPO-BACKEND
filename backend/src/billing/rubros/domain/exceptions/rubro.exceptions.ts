import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

export class TarifaImpuestoNotFoundException extends EntityNotFoundException {
  constructor() {
    super(
      'CatalogoTarifasImpuesto',
      'activa (Crea al menos una antes de crear una CategoriaTarifa)',
    );
  }
}
