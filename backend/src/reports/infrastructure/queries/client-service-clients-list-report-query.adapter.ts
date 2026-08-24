import { Injectable } from '@nestjs/common';
import { ClientService } from 'src/operations/clients/application/client.service';
import { ClientsListReportQueryPort } from '../../application/ports/report-query.ports';
import type {
  ClientsListReportFilters,
  ClientsListReportReadModel,
} from '../../application/read-models/clients-list.read-model';

@Injectable()
export class ClientServiceClientsListReportQueryAdapter extends ClientsListReportQueryPort {
  constructor(private readonly clientService: ClientService) {
    super();
  }

  async query(
    filters: ClientsListReportFilters,
  ): Promise<ClientsListReportReadModel> {
    const result = await this.clientService.findAll({
      ...filters,
      page: 1,
      limit: 9999,
    });

    return {
      clients: result.data.map((client) => ({
        identificacion: client.identificacion,
        nombres: client.nombres,
        apellidos: client.apellidos,
        razonSocial: client.razonSocial,
        email: client.email,
        telefono: client.telefono,
        direccionDomicilio: client.direccionDomicilio,
        activo: client.activo,
        tipoIdentificacion: client.tipoIdentificacion
          ? { descripcion: client.tipoIdentificacion.descripcion }
          : null,
      })),
      filters,
      generatedAt: new Date(),
    };
  }
}
