import { Injectable } from '@nestjs/common';
import { ClientService } from 'src/operations/clients/application/client.service';
import type { ReportSpec } from '../../interfaces/report-spec.interface';
import type { ClientsListReportFilterDto } from '../../interfaces/dto/clients-list-report-filter.dto';

@Injectable()
export class ClientsListReportSpec implements ReportSpec<ClientsListReportFilterDto> {
  readonly type = 'clients-list';

  constructor(private readonly clientService: ClientService) {}

  async fetchData(
    filters: ClientsListReportFilterDto,
  ): Promise<Record<string, unknown>> {
    // Reusa la lógica de findAll — sin paginación para PDF
    const result = await this.clientService.findAll({
      ...filters,
      page: 1,
      limit: 9999,
    });

    return {
      clientes: result.data,
      fecha: new Date().toLocaleDateString('es-EC', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      filtrosAplicados: this.describeFiltros(filters),
    };
  }

  private describeFiltros(filters: ClientsListReportFilterDto): string {
    const partes: string[] = [];
    if (filters.activo !== undefined)
      partes.push(filters.activo ? 'Solo activos' : 'Solo inactivos');
    if (filters.nombres) partes.push(`Nombres: "${filters.nombres}"`);
    if (filters.apellidos) partes.push(`Apellidos: "${filters.apellidos}"`);
    if (filters.identificacion)
      partes.push(`Identificación: "${filters.identificacion}"`);
    if (filters.nombreCompleto)
      partes.push(`Nombre: "${filters.nombreCompleto}"`);
    return partes.length ? partes.join(' · ') : 'Todos los clientes';
  }
}
