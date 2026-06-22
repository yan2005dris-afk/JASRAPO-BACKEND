import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { CreateDiscountDto } from '../interfaces/dto/create-discount.dto';
import { UpdateDiscountDto } from '../interfaces/dto/update-discount.dto';
import { DiscountFilterDto } from '../interfaces/dto/discount-filter.dto';
import { ApplyDiscountToPreinvoiceDto } from '../interfaces/dto/apply-discount-to-preinvoice.dto';

@Injectable()
export class DiscountsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDiscountDto) {
    const { rubroId, ...data } = dto;
    return this.prisma.catalogoDescuento.create({
      data: {
        ...data,
        rubroId: rubroId ?? null,
      },
    });
  }

  async findAll(filter: DiscountFilterDto) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = { activo: true };

    if (filter.tipoDescuento) {
      where.tipoDescuento = filter.tipoDescuento;
    }
    if (filter.aplicaAutomatico !== undefined) {
      where.aplicaAutomatico = filter.aplicaAutomatico === 'true';
    }

    const [items, total] = await Promise.all([
      this.prisma.catalogoDescuento.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prisma.catalogoDescuento.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findOne(id: number) {
    const discount = await this.prisma.catalogoDescuento.findUnique({
      where: { id },
    });
    if (!discount) {
      throw new NotFoundException(`Descuento con ID ${id} no encontrado`);
    }
    return discount;
  }

  async update(id: number, dto: UpdateDiscountDto) {
    await this.findOne(id);
    const { rubroId, ...data } = dto;
    return this.prisma.catalogoDescuento.update({
      where: { id },
      data: {
        ...data,
        rubroId: rubroId ?? undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.catalogoDescuento.update({
      where: { id },
      data: { activo: false },
    });
  }

  async applyToPreinvoice(
    prefacturaId: number,
    dto: ApplyDiscountToPreinvoiceDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Validar prefactura dentro de tx para evitar TOCTOU
      const prefactura = await tx.prefacturas.findUnique({
        where: { prefacturaId },
        include: { prefacturaDetalle: true },
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

      // 3. Encontrar detalle de cargo fijo
      const cargoFijoDetalle = prefactura.prefacturaDetalle.find((d) =>
        d.descripcion.includes('Cargo Fijo'),
      );

      if (!cargoFijoDetalle) {
        throw new BadRequestException(
          'No se encontró detalle de Cargo Fijo en la prefactura',
        );
      }

      // 4. Calcular monto — cap porcentaje en 100, redondeo a 2 decimales
      const montoCustom = dto.montoCustom ?? 0;
      const subtotal = Number(cargoFijoDetalle.subtotal);
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
          rubroId: cargoFijoDetalle.rubroId,
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

      // 5b. Registrar en descuento_detalle
      await tx.descuentoDetalle.create({
        data: {
          prefacturaDetalleId: cargoFijoDetalle.prefacturaDetalleId,
          catalogoDescuentoId: dto.catalogoDescuentoId,
          montoDescontado,
          esPorcentaje: catalogo.esPorcentaje,
          valorAplicado: montoCustom > 0 ? montoCustom : Number(catalogo.valor),
        },
      });

      // 5c. Actualizar totales de la prefactura
      return tx.prefacturas.update({
        where: { prefacturaId },
        data: {
          descuentoTotal: { increment: montoDescontado },
          totalPagar: { decrement: montoDescontado },
          saldoActual: { decrement: montoDescontado },
        },
        include: {
          prefacturaDetalle: true,
        },
      });
    });
  }
}
