import { Injectable } from '@nestjs/common';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';
import { EmitirNotaCreditoUseCase } from '../../../../../sri/emision/application/use-cases/emitir-nota-credito.use-case';
import { ComprobanteRepository } from '../../../../../sri/emision/domain/repositories/comprobante.repository';

import { TipoIdentificacion } from '../../../../../sri/emision/domain/constants/sri.enums';

@LogContext()
@Injectable()
export class PagoAnuladoHandler {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly comprobanteRepository: ComprobanteRepository,
    private readonly emitirNotaCreditoUseCase: EmitirNotaCreditoUseCase,
    private readonly logger: LoggerService,
  ) {}

  async procesarPagoAnulado(
    pagoId: bigint,
    motivoAnulacion: string,
  ): Promise<void> {
    this.logger.log(
      `Procesando pago.anulado: pagoId=${pagoId}, motivo=${motivoAnulacion}`,
    );

    const detalles =
      await this.paymentRepository.findPaymentDetailsByPagoId(pagoId);

    const comprobanteIdsUnicos = [
      ...new Set(
        detalles
          .map((d) => d.comprobanteId)
          .filter((id): id is bigint => id !== null && id !== undefined),
      ),
    ];

    for (const comprobanteId of comprobanteIdsUnicos) {
      const comprobante =
        await this.comprobanteRepository.findRecordById(comprobanteId);

      if (!comprobante) {
        this.logger.warn(
          `Comprobante ${comprobanteId} no encontrado para pago anulado ${pagoId}`,
        );
        continue;
      }

      // Solo si la factura previa está autorizada en SRI emitimos Nota de Crédito
      if (comprobante.estado !== 'AUTORIZADO') {
        this.logger.log(
          `Comprobante ${comprobanteId} en estado ${comprobante.estado} (no AUTORIZADO), no requiere Nota de Crédito electrónica`,
        );
        continue;
      }

      this.logger.log(
        `Emitiendo Nota de Crédito para factura ${comprobante.secuencial} (claveAcceso=${comprobante.clave_acceso}) vinculada al pago anulado ${pagoId}`,
      );

      try {
        await this.emitirNotaCreditoUseCase.emitirNotaCredito({
          emisor: {
            ruc: comprobante.receptor_identificacion
              ? '0999999999001'
              : '0999999999001',
            razonSocial: 'JASRAPO',
            dirMatriz: 'Matriz Principal',
            establecimiento: '001',
            puntoEmision: '001',
            obligadoContabilidad: 'NO',
          },
          comprador: {
            tipoIdentificacion:
              (comprobante.receptor_tipo_identificacion as TipoIdentificacion) ||
              TipoIdentificacion.CONSUMIDOR_FINAL,
            identificacion:
              comprobante.receptor_identificacion || '9999999999999',
            razonSocial:
              comprobante.receptor_razon_social || 'CONSUMIDOR FINAL',
            direccion: comprobante.receptor_direccion || 'S/N',
            email: comprobante.receptor_email || undefined,
          },
          codDocModificado: '01',
          numDocModificado: `${comprobante.clave_acceso ? comprobante.clave_acceso.slice(24, 27) : '001'}-${comprobante.clave_acceso ? comprobante.clave_acceso.slice(27, 30) : '001'}-${comprobante.secuencial.padStart(9, '0')}`,
          fechaEmision: new Date().toLocaleDateString('es-EC', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
          fechaEmisionDocSustento:
            comprobante.fecha_emision ||
            new Date().toLocaleDateString('es-EC', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }),
          motivo: motivoAnulacion || 'Anulación de pago / transacción',
          detalles: [
            {
              codigoPrincipal: 'ANUL-01',
              descripcion: `Anulación de comprobante ${comprobante.secuencial}`,
              cantidad: 1,
              precioUnitario: Number(comprobante.total_sin_impuestos || 0),
              descuento: 0,
              impuestos: [
                {
                  codigo: '2',
                  codigoPorcentaje: '0',
                  tarifa: 0,
                  baseImponible: Number(comprobante.total_sin_impuestos || 0),
                  valor: 0,
                },
              ],
            },
          ],
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'unknown';
        const stack = err instanceof Error ? err.stack : undefined;
        this.logger.error(
          `Error al emitir Nota de Crédito para comprobante ${comprobanteId}: ${message}`,
          stack,
        );
      }
    }
  }
}
