import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SendReportEmailDto } from './send-report-email.dto';
import { ClientsListReportFilterDto } from './clients-list-report-filter.dto';

/**
 * Body for `POST /reports/clients/email`. Unlike the other routes, this one
 * has no resource-derived recipient — the caller MUST supply `destinatario`
 * (enforced at runtime in the controller, since the base DTO declares it
 * as optional). Optional `filtros` narrows the client listing before
 * rendering the PDF.
 */
export class SendClientsListEmailDto extends SendReportEmailDto {
  @ApiPropertyOptional({
    description:
      'Filtros opcionales del listado de clientes (mismo DTO que el GET).',
    type: ClientsListReportFilterDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ClientsListReportFilterDto)
  filtros?: ClientsListReportFilterDto;
}
