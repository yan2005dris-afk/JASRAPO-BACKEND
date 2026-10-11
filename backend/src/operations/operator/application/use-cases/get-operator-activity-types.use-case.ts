import { Injectable } from '@nestjs/common';
import { OrdenesTrabajoService } from 'src/operations/work-orders/application/ordenes-trabajo.service';
import type { TipoActividad } from 'src/operations/work-orders/domain/types/tipo-actividad.type';

/**
 * Returns the canonical activity-types catalog managed by the work-orders
 * module. This use case is preserved for the operator module's
 * per-method use-case convention, but delegates the actual lookup so the
 * catalog has a single source of truth.
 */
@Injectable()
export class GetOperatorActivityTypesUseCase {
  constructor(private readonly ordenesTrabajoService: OrdenesTrabajoService) {}

  async execute(): Promise<TipoActividad[]> {
    return this.ordenesTrabajoService.getActivityTypes();
  }
}
