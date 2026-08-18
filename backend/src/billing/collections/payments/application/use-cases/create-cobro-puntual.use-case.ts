import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Decimal } from 'decimal.js';
import { EstadoPago, TipoDetallePago } from 'src/generated/prisma/enums';
import { CreateCobroPuntualDto } from '../../interfaces/dto/create-cobro-puntual.dto';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import { EventosPendientesRepository } from 'src/shared/outbox/domain/repositories/eventos-pendientes.repository';
import type { PaymentEntity } from '../../domain/entities/payment.entity';

interface DetalleItem {
  rubroId: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  iva: number;
  total: number;
  codigoImpuestoSri: string | null;
  codigoPorcentajeSri: string | null;
  tarifaImpuesto: number;
}

@Injectable()
export class CreateCobroPuntualUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentRepository: PaymentRepository,
    private readonly eventosPendientesRepository: EventosPendientesRepository,
  ) {}

  async execute(
    dto: CreateCobroPuntualDto,
    creadoPor = 'SYSTEM',
  ): Promise<PaymentEntity> {
    const contratoIdBigInt = BigInt(dto.contratoId);

    // 1. Validate the contract exists and is ACTIVO
    const contrato = await this.prisma.contratos.findUnique({
      where: { contratoId: contratoIdBigInt },
      include: { cliente: true },
    });

    if (!contrato) {
      throw new NotFoundException(`Contrato ${dto.contratoId} no encontrado`);
    }

    if (contrato.estado !== 'ACTIVO') {
      throw new BadRequestException(
        `El contrato ${dto.contratoId} no está ACTIVO`,
      );
    }

    const cliente = contrato.cliente;
    const clienteNombre =
      cliente.razonSocial ||
      `${cliente.nombres || ''} ${cliente.apellidos || ''}`.trim();

    // 2. Validate each rubroId exists and calculate totals
    let totalPagar = new Decimal(0);
    let subtotalPrefactura = new Decimal(0);
    let ivaPrefactura = new Decimal(0);

    const detalles: DetalleItem[] = [];

    for (const item of dto.items) {
      // Include tarifaImpuesto (Prisma relation name in Rubros model)
      const rubro = await this.prisma.rubros.findFirst({
        where: { rubroId: item.rubroId, activo: true, deletedAt: null },
        include: { tarifaImpuesto: true },
      });

      if (!rubro) {
        throw new NotFoundException(
          `Rubro ${item.rubroId} no encontrado o inactivo`,
        );
      }

      const cantidad = new Decimal(item.cantidad);
      const precioUnitario = new Decimal(rubro.precioUnitario);
      const subtotalItem = cantidad.times(precioUnitario);

      const porcentajeIva = rubro.tarifaImpuesto
        ? new Decimal(rubro.tarifaImpuesto.porcentaje)
        : new Decimal(0);
      const ivaItem = subtotalItem.times(porcentajeIva).dividedBy(100);
      const totalItem = subtotalItem.plus(ivaItem);

      subtotalPrefactura = subtotalPrefactura.plus(subtotalItem);
      ivaPrefactura = ivaPrefactura.plus(ivaItem);
      totalPagar = totalPagar.plus(totalItem);

      detalles.push({
        rubroId: rubro.rubroId,
        descripcion: item.descripcion || rubro.nombre,
        cantidad: cantidad.toNumber(),
        precioUnitario: precioUnitario.toNumber(),
        subtotal: subtotalItem.toNumber(),
        iva: ivaItem.toNumber(),
        total: totalItem.toNumber(),
        // codigoPorcentaje comes from tarifaImpuesto, codigoSri from rubro itself
        codigoImpuestoSri: rubro.codigoSri ?? null,
        codigoPorcentajeSri: rubro.tarifaImpuesto?.codigoPorcentaje ?? null,
        tarifaImpuesto: porcentajeIva.toNumber(),
      });
    }

    // Single Prisma Transaction
    const pagoId = await this.prisma.$transaction(async (tx) => {
      // a. Get the most recent ABIERTO period (Periodos uses estado enum, not activo bool)
      let periodoActivo = await tx.periodos.findFirst({
        where: { estado: 'ABIERTO', deletedAt: null },
        orderBy: { periodoId: 'desc' },
      });
      if (!periodoActivo) {
        // Fallback: use any period
        periodoActivo = await tx.periodos.findFirst({
          orderBy: { periodoId: 'desc' },
        });
      }
      if (!periodoActivo) {
        throw new BadRequestException(
          'No hay períodos configurados en el sistema',
        );
      }

      // b. Get first puntosEmision
      const puntoEmision = await tx.puntosEmision.findFirst({
        include: { establecimiento: true },
      });

      if (!puntoEmision) {
        throw new BadRequestException('No hay puntos de emisión configurados');
      }

      // c. Create a BORRADOR comprobante
      const comprobante = await tx.comprobantes.create({
        data: {
          estado: 'BORRADOR',
          emisorId: puntoEmision.establecimiento.emisorId,
          puntoEmisionId: puntoEmision.id,
          tipoComprobante: '01',
          ambiente: '1',
          tipoEmision: '1',
          secuencial: '',
          claveAcceso: '',
          fechaEmision: new Date(dto.fechaPago),
          importeTotal: totalPagar.toNumber(),
          totalSinImpuestos: subtotalPrefactura.toNumber(),
          receptorIdentificacion: cliente.identificacion,
          receptorRazonSocial: clienteNombre,
          receptorDireccion: cliente.direccionDomicilio,
          receptorEmail: cliente.email,
        },
      });

      // d. Create prefactura
      const prefactura = await tx.prefacturas.create({
        data: {
          contratoId: contratoIdBigInt,
          periodoId: periodoActivo.periodoId,
          puntoEmisionId: puntoEmision.id,
          clienteNombre,
          clienteIdentificacion: cliente.identificacion,
          clienteDireccion: cliente.direccionDomicilio,
          clienteEmail: cliente.email,
          subtotal: subtotalPrefactura.toNumber(),
          iva: ivaPrefactura.toNumber(),
          descuentoTotal: 0,
          totalPagar: totalPagar.toNumber(),
          estado: 'APROBADA',
          deudaAnterior: 0,
          saldoVencido: totalPagar.toNumber(),
          abono: 0,
          saldoActual: totalPagar.toNumber(),
          meses_atrasado: 0,
          comprobanteId: comprobante.id,
        },
      });

      // e. Create prefacturaDetalle records (explicit fields, no spread)
      await tx.prefacturaDetalle.createMany({
        data: detalles.map((d) => ({
          prefacturaId: prefactura.prefacturaId,
          rubroId: d.rubroId,
          descripcion: d.descripcion,
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
          subtotal: d.subtotal,
          iva: d.iva,
          total: d.total,
          codigoImpuestoSri: d.codigoImpuestoSri,
          codigoPorcentajeSri: d.codigoPorcentajeSri,
          tarifaImpuesto: d.tarifaImpuesto,
        })),
      });

      // f. Create pago record
      const pago = await this.paymentRepository.createPagoRecord(
        {
          clienteId: BigInt(dto.clienteId),
          cajaId: dto.cajaId ? BigInt(dto.cajaId) : null,
          banco: dto.banco ?? null,
          tarjetaCredito: dto.tarjetaCredito ?? null,
          fechaPago: new Date(dto.fechaPago),
          montoTotalRecibido: totalPagar.toNumber(),
          numeroOperacion: dto.numeroOperacion ?? null,
          observaciones: dto.observaciones ?? null,
          referenciaBanco: dto.referenciaBanco ?? null,
          comprobanteUrl: null,
          estadoPago: EstadoPago.REGISTRADO,
          creadoPor,
        },
        tx,
      );

      // g. Create detallesPago
      const formaPagoId = dto.banco ? 20 : dto.tarjetaCredito ? 19 : 1;

      await this.paymentRepository.createDetallesPago(
        [
          {
            pagoId: pago.pagoId,
            comprobanteId: comprobante.id,
            cuotaConvenioId: null,
            tipoPago: TipoDetallePago.PAGO_LIBRE,
            montoAbonado: totalPagar.toNumber(),
            formaPagoId,
            referencia: dto.referenciaBanco || dto.numeroOperacion || null,
            fechaTransaccion: new Date(dto.fechaPago),
          },
        ],
        tx,
      );

      // h. Trigger outbox event → pago-validado.handler handles SRI emission
      await this.eventosPendientesRepository.createPending(
        'pago.validado',
        {
          pagoId: pago.pagoId.toString(),
          estadoPago: EstadoPago.REGISTRADO,
          actualizadoPor: creadoPor,
        },
        'PAGO',
        pago.pagoId.toString(),
        tx as any,
      );

      return pago.pagoId;
    });

    return (await this.paymentRepository.findById(pagoId))!;
  }
}
