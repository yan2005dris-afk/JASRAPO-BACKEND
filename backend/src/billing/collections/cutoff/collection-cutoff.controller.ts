import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { CollectionCutoffService } from './collection-cutoff.service';

@ApiTags('collections')
@ApiBearerAuth()
@Controller('collections')
export class CollectionCutoffController {
  constructor(private readonly service: CollectionCutoffService) {}

  @Get('cutoff-candidates')
  @RequiredPermission('reportes', 'read')
  @ApiResponse({
    status: 200,
    description:
      'Devuelve candidatos informativos. DEUDA_PENDIENTE no se persiste como EN_MORA; sólo EN_MORA alcanza el umbral de mora. elegibleParaCorte sólo es true desde meses_para_corte. No crea órdenes CORTE ni aplica consecuencias por cuotas de convenio.',
  })
  @ApiOperation({
    summary: 'Listar candidatos a mora y corte de cobranza',
    description:
      'Evalúa únicamente deuda vencida del servicio corriente. No crea órdenes CORTE y no infiere consecuencias por cuotas vencidas de convenios.',
  })
  getCandidates() {
    return this.service.evaluate();
  }
}
