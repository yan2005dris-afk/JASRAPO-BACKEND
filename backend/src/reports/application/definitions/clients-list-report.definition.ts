import { Injectable } from '@nestjs/common';
import { resolveClientName } from 'src/infrastructure/pdf/utils/pdf-format.utils';
import { InstitutionalProfileResolver } from 'src/institutional-profile/application/institutional-profile.resolver';
import type { OfficialDocument } from 'src/institutional-profile/domain/institutional-profile.types';
import { attachInstitutionalProfile } from '../models/institutional-report';
import type { ProjectedReport } from '../models/report-projection';
import type { ReportRequestContext } from '../models/report-request-context';
import { ClientsListReportQueryPort } from '../ports/report-query.ports';
import type {
  ClientsListReportDocument,
  ClientsListReportFilters,
  ClientsListReportReadModel,
} from '../read-models/clients-list.read-model';

function describeFilters(filters: ClientsListReportFilters): string {
  const parts: string[] = [];
  if (filters.activo !== undefined) {
    const active = filters.activo === true || filters.activo === 'true';
    parts.push(active ? 'Solo activos' : 'Solo inactivos');
  }
  if (filters.fechaDesde || filters.fechaHasta) {
    const from = filters.fechaDesde
      ? new Date(`${filters.fechaDesde}T00:00:00`).toLocaleDateString('es-EC', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      : 'inicio';
    const to = filters.fechaHasta
      ? new Date(`${filters.fechaHasta}T00:00:00`).toLocaleDateString('es-EC', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      : 'hoy';
    parts.push(`Ingresados entre ${from} y ${to}`);
  }
  if (filters.nombres) parts.push(`Nombres: "${filters.nombres}"`);
  if (filters.apellidos) parts.push(`Apellidos: "${filters.apellidos}"`);
  if (filters.identificacion) {
    parts.push(`Identificación: "${filters.identificacion}"`);
  }
  if (filters.nombreCompleto) {
    parts.push(`Nombre: "${filters.nombreCompleto}"`);
  }
  return parts.length > 0 ? parts.join(' · ') : 'Todos los clientes';
}

export function projectClientsListReport(
  readModel: ClientsListReportReadModel,
): ProjectedReport<ClientsListReportDocument> {
  const clients = readModel.clients.map((client) => ({
    identificacion: client.identificacion,
    nombre: resolveClientName(client),
    email: client.email ?? '—',
    telefono: client.telefono ?? '—',
    direccion: client.direccionDomicilio ?? '—',
    activo: client.activo ? ('Activo' as const) : ('Inactivo' as const),
    tipoId: client.tipoIdentificacion?.descripcion ?? '—',
  }));

  return {
    document: {
      reporte: {
        titulo: 'Listado de Clientes',
        fecha: readModel.generatedAt.toLocaleDateString('es-EC', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
        filtrosAplicados: describeFilters(readModel.filters),
        totalClientes: clients.length,
        clientes: clients,
      },
    },
    recipientEmail: null,
  };
}

@Injectable()
export class ClientsListReportDefinition {
  constructor(
    private readonly queryPort: ClientsListReportQueryPort,
    private readonly institutionalProfiles: InstitutionalProfileResolver,
  ) {}

  async generate(
    context: ReportRequestContext<ClientsListReportFilters>,
  ): Promise<ProjectedReport<OfficialDocument<ClientsListReportDocument>>> {
    const [readModel, institutional] = await Promise.all([
      this.queryPort.query(context),
      this.institutionalProfiles.resolve(new Date()),
    ]);
    return attachInstitutionalProfile(
      projectClientsListReport(readModel),
      institutional,
    );
  }
}
