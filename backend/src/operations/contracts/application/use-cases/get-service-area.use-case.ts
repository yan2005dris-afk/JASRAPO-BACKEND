import { Injectable } from '@nestjs/common';
import { SERVICE_AREA } from '../../domain/policies/service-area.policy';
import type { IServiceArea } from '../../domain/types/service-area.types';

@Injectable()
export class GetServiceAreaUseCase {
  execute(): IServiceArea {
    return SERVICE_AREA;
  }
}
