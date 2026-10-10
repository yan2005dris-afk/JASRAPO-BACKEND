import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import type { Prisma } from 'src/generated/prisma/client';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
import {
  OpenCashSessionDto,
  CreateCashMovementDto,
  CloseCashSessionDto,
} from '../../interfaces/dto/cash-session.dto';

@Injectable()
export class PrismaCashSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentSession(creadoPor?: string) {
    const where: Prisma.CajaSesionWhereInput = { estado: 'ABIERTA' };
    if (creadoPor) {
      where.creadoPor = creadoPor;
    }

    const session = await this.prisma.cajaSesion.findFirst({
      where,
      orderBy: { fechaApertura: 'desc' },
      include: {
        movimientos: {
          orderBy: { createdAt: 'desc' },
        },
        pagos: {
          include: {
            cliente: {
              select: {
                clienteId: true,
                nombres: true,
                apellidos: true,
                identificacion: true,
                razonSocial: true,
              },
            },
            detallePago: {
              include: {
                formaPago: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!session) {
      return null;
    }

    // Calcular KPIs y totales acumulados de la sesión
    const pagosValidos = session.pagos.filter(
      (p) => p.estadoPago !== 'ANULADO',
    );

    let totalRecaudado = 0;
    let totalEfectivo = 0;
    let totalTransferencia = 0;
    let totalTarjeta = 0;

    for (const p of pagosValidos) {
      const monto = Number(p.montoTotalRecibido) || 0;
      totalRecaudado += monto;

      if (p.banco) {
        totalTransferencia += monto;
      } else if (p.tarjetaCredito) {
        totalTarjeta += monto;
      } else {
        totalEfectivo += monto;
      }
    }

    let totalEgresos = 0;
    let totalIngresosExtra = 0;

    for (const m of session.movimientos) {
      const monto = Number(m.monto) || 0;
      if (m.tipoMovimiento === 'EGRESO') {
        totalEgresos += monto;
      } else {
        totalIngresosExtra += monto;
      }
    }

    const montoApertura = Number(session.montoApertura) || 0;
    const efectivoEsperado =
      montoApertura + totalEfectivo + totalIngresosExtra - totalEgresos;

    return {
      cajaId: session.cajaId.toString(),
      creadoPor: session.creadoPor,
      fechaApertura: session.fechaApertura,
      estado: session.estado,
      montoApertura,
      resumen: {
        totalRecaudado: Number(totalRecaudado.toFixed(2)),
        totalEfectivo: Number(totalEfectivo.toFixed(2)),
        totalTransferencia: Number(totalTransferencia.toFixed(2)),
        totalTarjeta: Number(totalTarjeta.toFixed(2)),
        totalEgresos: Number(totalEgresos.toFixed(2)),
        totalIngresosExtra: Number(totalIngresosExtra.toFixed(2)),
        efectivoEsperado: Number(efectivoEsperado.toFixed(2)),
        cantidadPagos: pagosValidos.length,
        cantidadMovimientos: session.movimientos.length,
      },
      movimientos: session.movimientos.map((m) => ({
        id: m.id.toString(),
        tipoMovimiento: m.tipoMovimiento,
        monto: Number(m.monto),
        motivo: m.motivo,
        comprobanteRef: m.comprobanteRef,
        creadoPor: m.creadoPor,
        createdAt: m.createdAt,
      })),
      pagos: pagosValidos.map((p) => ({
        pagoId: p.pagoId.toString(),
        clienteNombre:
          p.cliente?.razonSocial ||
          `${p.cliente?.apellidos || ''} ${p.cliente?.nombres || ''}`.trim() ||
          p.cliente?.identificacion ||
          'Cliente',
        clienteIdentificacion: p.cliente?.identificacion,
        montoTotalRecibido: Number(p.montoTotalRecibido),
        fechaPago: p.fechaPago,
        metodo: p.banco
          ? `BANCO: ${p.banco}`
          : p.tarjetaCredito
            ? `TARJETA: ${p.tarjetaCredito}`
            : 'EFECTIVO',
        numeroOperacion: p.numeroOperacion,
        referenciaBanco: p.referenciaBanco,
      })),
    };
  }

  async openSession(dto: OpenCashSessionDto, creadoPor: string) {
    // Verificar si ya hay una caja abierta por este cajero
    const existing = await this.prisma.cajaSesion.findFirst({
      where: {
        creadoPor,
        estado: 'ABIERTA',
      },
    });

    if (existing) {
      throw new EntityAlreadyExistsException(
        'Sesión de caja',
        'usuario',
        creadoPor,
      );
    }

    const session = await this.prisma.cajaSesion.create({
      data: {
        creadoPor,
        montoApertura: dto.montoApertura,
        estado: 'ABIERTA',
      },
    });

    return {
      cajaId: session.cajaId.toString(),
      creadoPor: session.creadoPor,
      fechaApertura: session.fechaApertura,
      montoApertura: Number(session.montoApertura),
      estado: session.estado,
    };
  }

  async addMovement(
    cajaId: bigint,
    dto: CreateCashMovementDto,
    creadoPor: string,
  ) {
    const session = await this.prisma.cajaSesion.findUnique({
      where: { cajaId },
    });

    if (!session) {
      throw new EntityNotFoundException('Sesión de caja', cajaId);
    }

    if (session.estado !== 'ABIERTA') {
      throw new InvalidDomainOperationException(
        'No se pueden registrar gastos en una caja cerrada',
      );
    }

    const mov = await this.prisma.cajaMovimiento.create({
      data: {
        cajaId,
        tipoMovimiento: dto.tipoMovimiento,
        monto: dto.monto,
        motivo: dto.motivo,
        comprobanteRef: dto.comprobanteRef,
        creadoPor,
      },
    });

    return {
      id: mov.id.toString(),
      cajaId: mov.cajaId.toString(),
      tipoMovimiento: mov.tipoMovimiento,
      monto: Number(mov.monto),
      motivo: mov.motivo,
      comprobanteRef: mov.comprobanteRef,
      createdAt: mov.createdAt,
    };
  }

  async closeSession(
    cajaId: bigint,
    dto: CloseCashSessionDto,
    _cerradoPor: string,
  ) {
    const session = await this.prisma.cajaSesion.findUnique({
      where: { cajaId },
      include: {
        movimientos: true,
        pagos: true,
      },
    });

    if (!session) {
      throw new EntityNotFoundException('Sesión de caja', cajaId);
    }

    if (session.estado !== 'ABIERTA') {
      throw new InvalidDomainOperationException(
        'La sesión de caja ya se encuentra cerrada',
      );
    }

    // 1. Calcular arqueo físico real
    let montoCierreReal = 0;
    const arqueoRecords = (dto.arqueo || []).map((item) => {
      const subtotal = Number((item.denominacion * item.cantidad).toFixed(2));
      montoCierreReal += subtotal;
      return {
        cajaId,
        denominacion: item.denominacion,
        cantidad: item.cantidad,
        subtotal,
        esMoneda: item.esMoneda ?? item.denominacion < 1,
      };
    });

    // 2. Calcular sistema
    const pagosValidos = session.pagos.filter(
      (p) => p.estadoPago !== 'ANULADO',
    );
    let totalEfectivo = 0;
    for (const p of pagosValidos) {
      if (!p.banco && !p.tarjetaCredito) {
        totalEfectivo += Number(p.montoTotalRecibido) || 0;
      }
    }

    let totalEgresos = 0;
    let totalIngresosExtra = 0;
    for (const m of session.movimientos) {
      const monto = Number(m.monto) || 0;
      if (m.tipoMovimiento === 'EGRESO') totalEgresos += monto;
      else totalIngresosExtra += monto;
    }

    const montoApertura = Number(session.montoApertura) || 0;
    const montoCierreSistema = Number(
      (
        montoApertura +
        totalEfectivo +
        totalIngresosExtra -
        totalEgresos
      ).toFixed(2),
    );
    const diferencia = Number(
      (montoCierreReal - montoCierreSistema).toFixed(2),
    );
    const nuevoEstado = Math.abs(diferencia) < 0.01 ? 'CERRADA' : 'DESCUADRADA';

    return await this.prisma.$transaction(async (tx) => {
      // Guardar detalle arqueo
      if (arqueoRecords.length > 0) {
        await tx.cajaArqueoDetalle.createMany({
          data: arqueoRecords,
        });
      }

      // Actualizar sesión
      const updated = await tx.cajaSesion.update({
        where: { cajaId },
        data: {
          montoCierreSistema,
          montoCierreReal,
          totalTransferenciasDeclaradas: dto.totalTransferenciasDeclaradas ?? 0,
          novedadCierre:
            dto.novedadCierre ||
            (diferencia !== 0 ? `Diferencia: $${diferencia}` : undefined),
          estado: nuevoEstado,
        },
      });

      return {
        cajaId: updated.cajaId.toString(),
        estado: updated.estado,
        montoApertura,
        montoCierreSistema,
        montoCierreReal,
        diferencia,
        novedadCierre: updated.novedadCierre,
      };
    });
  }

  async getHistory(limit = 20, page = 1) {
    const skip = (page - 1) * limit;
    const [sessions, total] = await Promise.all([
      this.prisma.cajaSesion.findMany({
        skip,
        take: limit,
        orderBy: { fechaApertura: 'desc' },
        include: {
          _count: {
            select: { pagos: true, movimientos: true },
          },
        },
      }),
      this.prisma.cajaSesion.count(),
    ]);

    return {
      data: sessions.map((s) => ({
        cajaId: s.cajaId.toString(),
        creadoPor: s.creadoPor,
        fechaApertura: s.fechaApertura,
        montoApertura: Number(s.montoApertura),
        montoCierreSistema: s.montoCierreSistema
          ? Number(s.montoCierreSistema)
          : null,
        montoCierreReal: s.montoCierreReal ? Number(s.montoCierreReal) : null,
        estado: s.estado,
        novedadCierre: s.novedadCierre,
        cantidadPagos: s._count.pagos,
        cantidadMovimientos: s._count.movimientos,
      })),
      total,
      page,
      limit,
    };
  }
}
