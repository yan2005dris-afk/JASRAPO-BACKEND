import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DiscountRepository } from '../../domain/repositories/discount.repository';
import { ApplyDiscountToPreinvoiceDto } from '../../interfaces/dto/apply-discount-to-preinvoice.dto';

@Injectable()
export class ApplyDiscountToPreinvoiceUseCase {
  constructor(private readonly discountRepository: DiscountRepository) {}

  async execute(prefacturaId: number, dto: ApplyDiscountToPreinvoiceDto) {
    return this.discountRepository.executeTransaction(async (tx) => {
      // 1. Validar prefactura dentro de tx para evitar TOCTOU
      const prefactura = await tx.prefacturas.findUnique({
        where: { prefacturaId },
        include: {
          prefacturaDetalle: {
            include: { rubro: { select: { codigoSri: true } } },
          },
        },
      });

      if (!prefactura) {
        throw new NotFoundException(`Prefactura ${prefacturaId} no encontrada`);
      }

      if (prefactura.estado === 'PAGADA' || prefactura.estado === 'ANULADA') {
        throw new BadRequestException(
          `No se puede aplicar descuento a una prefactura en estado ${prefactura.estado}`,
        );
      }

      // 2. Validar descuento del catálogo dentro de tx
      const catalogo = await tx.catalogoDescuento.findUnique({
        where: { id: dto.catalogoDescuentoId },
      });

      if (!catalogo || !catalogo.activo) {
        throw new NotFoundException(
          'Descuento del catálogo no encontrado o inactivo',
        );
      }

      // 3. Encontrar el detalle al que aplica el descuento:
      //    Si el catálogo tiene rubroId → buscar por ese rubro específico.
      //    Si no → fallback al detalle de Cargo Fijo (codigoSri '002').
      const targetDetalle = catalogo.rubroId
        ? prefactura.prefacturaDetalle.find(
            (d: any) => d.rubroId === catalogo.rubroId,
          )
        : prefactura.prefacturaDetalle.find(
            (d: any) => d.rubro?.codigoSri === '002',
          );

      if (!targetDetalle) {
        throw new BadRequestException(
          catalogo.rubroId
            ? `No se encontró detalle para el rubro ID ${catalogo.rubroId} en la prefactura`
            : 'No se encontró detalle de Cargo Fijo en la prefactura',
        );
      }

      // 4. Calcular monto — cap porcentaje en 100, redondeo a 2 decimales
      const montoCustom = dto.montoCustom ?? 0;
      const subtotal = Number(targetDetalle.subtotal);
      let montoDescontado: number;

      if (montoCustom > 0) {
        montoDescontado = Math.min(montoCustom, subtotal);
      } else if (catalogo.esPorcentaje) {
        const pct = Math.min(Number(catalogo.valor), 100);
        montoDescontado = subtotal * (pct / 100);
      } else {
        montoDescontado = Math.min(Number(catalogo.valor), subtotal);
      }

      montoDescontado = Math.round(montoDescontado * 100) / 100;

      if (montoDescontado <= 0) {
        throw new BadRequestException(
          'El monto del descuento debe ser mayor a 0',
        );
      }

      // 5a. Crear línea de descuento en prefactura_detalle
      await tx.prefacturaDetalle.create({
        data: {
          prefacturaId,
          rubroId: targetDetalle.rubroId,
          descripcion: dto.motivo
            ? `Descuento: ${catalogo.nombre} — ${dto.motivo}`
            : `Descuento: ${catalogo.nombre}`,
          cantidad: 1,
          precioUnitario: -montoDescontado,
          subtotal: -montoDescontado,
          iva: 0,
          total: -montoDescontado,
          descuento: montoDescontado,
          tarifaImpuesto: 0,
          codigoImpuestoSri: '2',
          codigoPorcentajeSri: '0',
        },
      });

      // 5b. Registrar en descuento_detalle vinculado al detalle objetivo
      await tx.descuentoDetalle.create({
        data: {
          prefacturaDetalleId: targetDetalle.prefacturaDetalleId,
          catalogoDescuentoId: dto.catalogoDescuentoId,
          montoDescontado,
          esPorcentaje: catalogo.esPorcentaje,
          valorAplicado: montoCustom > 0 ? montoCustom : Number(catalogo.valor),
          motivo: dto.motivo ?? null,
          autorizadoPor: dto.autorizadoPor ?? null,
        },
      });

      return tx.prefacturas.update({
        where: { prefacturaId },
        data: {
          descuentoTotal: { increment: montoDescontado },
          totalPagar: { decrement: montoDescontado },
          saldoActual: { decrement: montoDescontado },
        },
        include: { prefacturaDetalle: true },
      });
    });
  }
}
