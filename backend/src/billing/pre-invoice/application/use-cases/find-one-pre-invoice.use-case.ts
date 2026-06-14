import { Injectable, NotFoundException } from '@nestjs/common';
import { PreInvoiceRepository } from '../../domain/repositories/pre-invoice.repository';

@Injectable()
export class FindOnePreInvoiceUseCase {
  constructor(private readonly preInvoiceRepository: PreInvoiceRepository) {}

  async execute(id: number) {
    const preInvoice = await this.preInvoiceRepository.findById(id, {
      include: {
        prefacturaDetalle: {
          include: { rubro: { select: { nombre: true } } },
        },
        contrato: {
          select: {
            contratoId: true,
            numeroGuia: true,
            cliente: {
              select: {
                clienteId: true,
                nombres: true,
                apellidos: true,
                identificacion: true,
                direccionDomicilio: true,
                email: true,
              },
            },
          },
        },
        lote: {
          select: {
            loteId: true,
            estado: true,
            comunidad: { select: { nombre: true } },
          },
        },
        periodoRel: {
          select: { nombre: true, fechaInicio: true, fechaFin: true },
        },
      },
    });

    if (!preInvoice) {
      throw new NotFoundException(`Pre-invoice ${id} not found`);
    }

    return preInvoice;
  }
}
