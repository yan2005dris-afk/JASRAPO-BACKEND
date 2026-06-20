import { Injectable, Logger, NotFoundException } from '@nestjs/common';
<<<<<<<< HEAD:backend/src/sri/application/services/sri-integration.service.ts
import { PrismaService } from '../../../infrastructure/database/prisma.service';
========
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
>>>>>>>> origin/develop:backend/src/sri/emision/application/services/sri-integration.service.ts
import { SriService } from './sri.service';
import { CreateFacturaDto } from '../../interfaces/dto';
import { TipoIdentificacion, FormaPago } from '../../domain/constants';
import { format } from 'date-fns';

@Injectable()
export class SriIntegrationService {
  private readonly logger = new Logger(SriIntegrationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sriService: SriService,
  ) {}

  /**
   * Toma una prefactura de JASRAPO y la convierte en una Factura Electrónica en el SRI
   */
  async emitirFacturaDesdePrefactura(prefacturaId: number, _emisorId: number) {
    this.logger.log(`Iniciando emisión SRI para prefactura: ${prefacturaId}`);

    // 1. Obtener la prefactura con sus detalles y cliente
    const prefactura = await this.prisma.prefacturas.findUnique({
      where: { prefacturaId: BigInt(prefacturaId) },
      include: {
        prefacturaDetalle: {
          include: {
            rubro: true,
          },
        },
        contrato: {
          include: {
            cliente: true,
          },
        },
        puntoEmision: {
          include: {
            establecimiento: {
              include: {
                emisor: true,
              },
            },
          },
        },
      },
    });

    if (!prefactura) {
      throw new NotFoundException(`Prefactura ${prefacturaId} no encontrada`);
    }

    const emisor = prefactura.puntoEmision.establecimiento.emisor;

    // 2. Mapear al DTO que espera el motor SRI migrado
    const facturaDto: CreateFacturaDto = {
      fechaEmision: format(prefactura.createdAt, 'dd/MM/yyyy'),
      emisor: {
        ruc: emisor.ruc,
        razonSocial: emisor.razonSocial,
        dirMatriz: emisor.direccionMatriz,
        establecimiento: prefactura.puntoEmision.establecimiento.codigo,
        puntoEmision: prefactura.puntoEmision.codigo,
        obligadoContabilidad: emisor.obligadoContabilidad ? 'SI' : 'NO',
      },
      comprador: {
        tipoIdentificacion: this.mapTipoIdentificacion(
          Number(prefactura.contrato.cliente.tipoIdentificacionId),
        ),
        identificacion: prefactura.contrato.cliente.identificacion,
        razonSocial: `${prefactura.contrato.cliente.nombres} ${prefactura.contrato.cliente.apellidos}`,
        direccion: prefactura.clienteDireccion || 'S/N',
        email: prefactura.clienteEmail || undefined,
      },
      detalles: prefactura.prefacturaDetalle.map((det) => ({
        codigoPrincipal: det.rubroId.toString(),
        descripcion: det.rubro.nombre,
        cantidad: Number(det.cantidad),
        precioUnitario: Number(det.precioUnitario),
        descuento: Number(det.descuento),
        impuestos: [
          {
            codigo: '2', // IVA
            codigoPorcentaje: '2', // 12%
            tarifa: 12,
            baseImponible: Number(det.subtotal),
            valor: Number(det.subtotal) * 0.12,
          },
        ],
      })),
      pagos: [
        {
          formaPago: FormaPago.SIN_UTILIZACION_SISTEMA_FINANCIERO,
          total: Number(prefactura.totalPagar),
        },
      ],
      infoAdicional: [
        { nombre: 'Contrato', valor: prefactura.contratoId.toString() },
      ],
    };

    // 3. Llamar al motor SRI
    const result = await this.sriService.emitirFactura(facturaDto);

    // 4. Actualizar la prefactura con el ID del comprobante
    if (result && 'claveAcceso' in result) {
      const comprobante = await this.prisma.comprobantes.findUnique({
        where: { claveAcceso: result.claveAcceso },
      });

      if (comprobante) {
        await this.prisma.prefacturas.update({
          where: { prefacturaId: BigInt(prefacturaId) },
          data: {
            comprobanteId: comprobante.id,
          },
        });
      }
    }

    return result;
  }

  private mapTipoIdentificacion(tipoId: number): TipoIdentificacion {
    // Mapeo según catálogo: 1=RUC('04'), 2=CEDULA('05'), 3=PASAPORTE('06'), 4=CONSUMIDOR_FINAL('07')
    const map: Record<number, TipoIdentificacion> = {
      1: TipoIdentificacion.RUC,
      2: TipoIdentificacion.CEDULA,
      3: TipoIdentificacion.PASAPORTE,
      4: TipoIdentificacion.CONSUMIDOR_FINAL,
    };
    return map[tipoId] || TipoIdentificacion.CEDULA;
  }
}
