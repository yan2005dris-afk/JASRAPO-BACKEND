import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { GuiaRemisionRepository } from '../../domain/repositories/guia-remision.repository';
import {
  DestinatarioGuiaRecord,
  DetalleGuiaRecord,
} from '../../domain/interfaces/repository.interface';
import { Prisma } from '../../../generated/prisma/client.js';

@Injectable()
export class PrismaGuiaRemisionRepository extends GuiaRemisionRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async createDestinatarios(
    destinatarios: DestinatarioGuiaRecord[],
    tx?: Prisma.TransactionClient,
  ): Promise<DestinatarioGuiaRecord[]> {
    if (destinatarios.length === 0) return [];
    const client = tx ?? this.prisma;

    const created = await Promise.all(
      destinatarios.map((d) =>
        client.destinatariosGuia.create({
          data: {
            comprobanteId: d.comprobante_id,
            identificacionDestinatario: d.identificacion_destinatario,
            razonSocialDestinatario: d.razon_social_destinatario,
            dirDestinatario: d.dir_destinatario ?? undefined,
            motivoTraslado: d.motivo_traslado ?? undefined,
            docAduaneroUnico: d.doc_aduanero_unico ?? undefined,
            codEstabDestino: d.cod_estab_destino ?? undefined,
            ruta: d.ruta ?? undefined,
            codDocSustento: d.cod_doc_sustento ?? undefined,
            numDocSustento: d.num_doc_sustento ?? undefined,
            numAutDocSustento: d.num_aut_doc_sustento ?? undefined,
            fechaEmisionDocSustento: d.fecha_emision_doc_sustento
              ? new Date(d.fecha_emision_doc_sustento)
              : undefined,
          },
        }),
      ),
    );

    return created.map((r) => ({
      id: r.id,
      comprobante_id: r.comprobanteId,
      identificacion_destinatario: r.identificacionDestinatario,
      razon_social_destinatario: r.razonSocialDestinatario,
      dir_destinatario: r.dirDestinatario ?? undefined,
      motivo_traslado: r.motivoTraslado ?? undefined,
      doc_aduanero_unico: r.docAduaneroUnico ?? undefined,
      cod_estab_destino: r.codEstabDestino ?? undefined,
      ruta: r.ruta ?? undefined,
      cod_doc_sustento: r.codDocSustento ?? undefined,
      num_doc_sustento: r.numDocSustento ?? undefined,
      num_aut_doc_sustento: r.numAutDocSustento ?? undefined,
      fecha_emision_doc_sustento:
        r.fechaEmisionDocSustento?.toISOString?.() ?? undefined,
    }));
  }

  async createDetalles(
    detalles: DetalleGuiaRecord[],
    tx?: Prisma.TransactionClient,
  ): Promise<DetalleGuiaRecord[]> {
    if (detalles.length === 0) return [];
    const client = tx ?? this.prisma;

    const created = await client.detallesGuia.createManyAndReturn({
      data: detalles.map((d) => ({
        destinatarioId: d.destinatario_id,
        codigoInterno: d.codigo_interno,
        codigoAdicional: d.codigo_adicional ?? undefined,
        descripcion: d.descripcion,
        cantidad: new Prisma.Decimal(d.cantidad),
      })),
    });

    return created.map((r) => ({
      id: r.id,
      destinatario_id: r.destinatarioId,
      codigo_interno: r.codigoInterno,
      codigo_adicional: r.codigoAdicional ?? undefined,
      descripcion: r.descripcion,
      cantidad: Number(r.cantidad),
    }));
  }
}
