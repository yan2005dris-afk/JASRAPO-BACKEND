import { NotFoundException } from '@nestjs/common';

export class TarifaImpuestoNotFoundException extends NotFoundException {
  constructor() {
    super(
      'No hay tarifas de impuesto activas. Crea al menos una (CatalogoTarifasImpuesto) antes de crear una CategoriaTarifa.',
    );
  }
}
