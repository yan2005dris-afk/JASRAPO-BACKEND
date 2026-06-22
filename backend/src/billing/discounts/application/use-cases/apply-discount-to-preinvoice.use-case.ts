import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Decimal } from 'decimal.js';
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

      // 4. Calcular monto con aritmética decimal exacta
      const montoCustom = new Decimal(dto.montoCustom ?? 0);
      const subtotal = new Decimal(targetDetalle.subtotal.toString());
      let montoDescontado: Decimal;

      if (montoCustom.greaterThan(0)) {
        montoDescontado = Decimal.min(montoCustom, subtotal);
      } else if (catalogo.esPorcentaje) {
        const pct = Decimal.min(
          new Decimal(catalogo.valor.toString()),
          new Decimal(100),
        );
        montoDescontado = subtotal.times(pct.dividedBy(100));
      } else {
        montoDescontado = Decimal.min(
          new Decimal(catalogo.valor.toString()),
          subtotal,
        );
      }

      montoDescontado = montoDescontado.toDecimalPlaces(
        2,
        Decimal.ROUND_HALF_UP,
      );

      if (montoDescontado.lessThanOrEqualTo(0)) {
        throw new BadRequestException(
          'El monto del descuento debe ser mayor a 0',
        );
      }

      const montoFinal = montoDescontado.toNumber();

      // 5a. Crear línea de descuento en prefactura_detalle
      await tx.prefacturaDetalle.create({
        data: {
          prefacturaId,
          rubroId: targetDetalle.rubroId,
          descripcion: dto.motivo
            ? `Descuento: ${catalogo.nombre} — ${dto.motivo}`
            : `Descuento: ${catalogo.nombre}`,
          cantidad: 1,
          precioUnitario: -montoFinal,
          subtotal: -montoFinal,
          iva: 0,
          total: -montoFinal,
          descuento: montoFinal,
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
          montoDescontado: montoFinal,
          esPorcentaje: catalogo.esPorcentaje,
          valorAplicado: montoCustom.greaterThan(0)
            ? montoCustom.toNumber()
            : new Decimal(catalogo.valor.toString()).toNumber(),
        },
      });

      // 5c. Actualizar totales de la prefactura
      return tx.prefacturas.update({
        where: { prefacturaId },
        data: {
          descuentoTotal: { increment: montoFinal },
          totalPagar: { decrement: montoFinal },
          saldoActual: { decrement: montoFinal },
        },
        include: { prefacturaDetalle: true },
      });
    });
  }
}
