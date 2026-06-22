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

    const where: any = {};

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
      where: { id: id },
    });
    if (!discount) {
      throw new Error(`Descuento con ID ${id} no encontrado`);
    }
    return discount;
  }

  async update(id: number, dto: UpdateDiscountDto) {
    await this.findOne(id);
    const { rubroId, ...data } = dto;
    return this.prisma.catalogoDescuento.update({
      where: { id: id },
      data: {
        ...data,
        rubroId: rubroId ?? undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.catalogoDescuento.update({
      where: { id: id },
      data: { activo: false },
    });
  }

  async applyToPreinvoice(
    prefacturaId: number,
    dto: ApplyDiscountToPreinvoiceDto,
  ) {
    // 1. Validar prefactura existe y está en estado válido
    const prefactura = await this.prisma.prefacturas.findUnique({
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

    // 2. Validar descuento del catálogo
    const catalogo = await this.prisma.catalogoDescuento.findUnique({
      where: { id: dto.catalogoDescuentoId },
    });

    if (!catalogo || !catalogo.activo) {
      throw new NotFoundException(
        'Descuento del catálogo no encontrado o inactivo',
      );
    }

    // 3. Encontrar el detalle de cargo fijo para vincular descuento_detalle
    const cargoFijoDetalle = prefactura.prefacturaDetalle.find((d) =>
      d.descripcion.includes('Cargo Fijo'),
    );

    if (!cargoFijoDetalle) {
      throw new BadRequestException(
        'No se encontró detalle de Cargo Fijo en la prefactura',
      );
    }

    // 4. Calcular monto
    const montoCustom = dto.montoCustom ?? 0;
    const montoDescontado =
      montoCustom > 0
        ? Math.min(montoCustom, Number(cargoFijoDetalle.subtotal))
        : catalogo.esPorcentaje
          ? Number(cargoFijoDetalle.subtotal) * (Number(catalogo.valor) / 100)
          : Math.min(Number(catalogo.valor), Number(cargoFijoDetalle.subtotal));

    if (montoDescontado <= 0) {
      throw new BadRequestException(
        'El monto del descuento debe ser mayor a 0',
      );
    }

    // 5. Ejecutar en transacción
    return this.prisma.$transaction(async (tx) => {
      // 5a. Crear línea de descuento en prefactura_detalle
      const detalle = await tx.prefacturaDetalle.create({
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

      // 5b. Registrar en descuento_detalle (vinculado al cargo_fijo)
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
      const updated = await tx.prefacturas.update({
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

      return updated;
    });
  }
}
