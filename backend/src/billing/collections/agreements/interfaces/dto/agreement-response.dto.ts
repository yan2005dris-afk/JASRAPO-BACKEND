import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InstallmentResponseDto } from './installment-response.dto';
import type { AgreementRow } from '../../domain/types/agreement.types';
import { DateUtil } from 'src/shared/utils/date.util';

export class AgreementResponseDto {
  @ApiProperty({ example: '1', description: 'ID del convenio' })
  convenioId: string;

  @ApiProperty({ example: '1', description: 'ID del contrato asociado' })
  contratoId: string;

  @ApiProperty({ example: 6, description: 'Número total de cuotas' })
  numeroCuotas: number;

  @ApiProperty({ example: 50.0, description: 'Abono inicial pagado' })
  abonoInicial: number;

  @ApiProperty({
    example: 215.75,
    description: 'Deuda total al momento de crear el convenio',
  })
  deudaTotal: number;

  @ApiProperty({
    example: 3,
    description: 'Meses de mora al momento de crear el convenio',
  })
  mesesMoraActual: number;

  @ApiProperty({
    description: 'Estado del convenio',
    example: { codigo: 'ACTIVO', nombre: 'ACTIVO' },
  })
  estado: {
    codigo: string;
    nombre: string;
  };

  @ApiPropertyOptional({
    example: '2026-06-01',
    description: 'Fecha de aprobación (YYYY-MM-DD)',
  })
  fechaAprobacion: string | null;

  @ApiProperty({
    example: '2026-06-01',
    description: 'Fecha del primer pago (YYYY-MM-DD)',
  })
  fechaPrimerPago: string;

  @ApiPropertyOptional({
    example: '2026-07-01',
    description: 'Fecha del próximo pago (YYYY-MM-DD)',
  })
  fechaProximoPago: string | null;

  @ApiProperty({ example: 0.0, description: 'Monto pagado hasta ahora' })
  montoPagadoActual: number;

  @ApiPropertyOptional({
    example: 'Problemas económicos temporales',
    description: 'Motivo del convenio',
  })
  motivo: string | null;

  @ApiProperty({
    example: '2026-05-10',
    description: 'Fecha de creación (YYYY-MM-DD)',
  })
  fechaCreacion: string;

  @ApiPropertyOptional({
    type: [InstallmentResponseDto],
    description: 'Cuotas generadas para este convenio',
  })
  cuotas?: InstallmentResponseDto[];

  @ApiPropertyOptional({
    example: 'GUIA-1-0051',
    description: 'Número de guía del contrato asociado',
  })
  numeroGuia?: string;

  @ApiPropertyOptional({
    example: 'María Pérez',
    description: 'Nombre del cliente (razón social o nombres + apellidos)',
  })
  clienteNombre?: string;

  @ApiPropertyOptional({
    example: '1105123456',
    description: 'Identificación del cliente',
  })
  clienteIdentificacion?: string;

  @ApiPropertyOptional({
    example: 'maria@ejemplo.com',
    description: 'Email del cliente',
  })
  clienteEmail?: string | null;

  static fromRow(convenio: AgreementRow): AgreementResponseDto {
    const dto = new AgreementResponseDto();
    dto.convenioId = String(convenio.convenioId);
    dto.contratoId = String(convenio.contratoId);
    dto.numeroCuotas = convenio.numeroCuotas;
    dto.abonoInicial = Number(convenio.abonoInicial);
    dto.deudaTotal = Number(convenio.deudaTotal);
    dto.mesesMoraActual = convenio.mesesMoraActual;
    dto.estado = {
      codigo: convenio.estado,
      nombre: convenio.estado,
    };
    dto.fechaAprobacion = DateUtil.formatForFrontend(convenio.fechaAprobacion);
    dto.fechaPrimerPago = DateUtil.formatForFrontend(convenio.fechaPrimerPago)!;
    dto.fechaProximoPago = DateUtil.formatForFrontend(
      convenio.fechaProximoPago,
    );
    dto.montoPagadoActual = Number(convenio.montoPagadoActual);
    dto.motivo = convenio.motivo ?? null;
    dto.fechaCreacion = DateUtil.formatForFrontend(convenio.createdAt)!;
    dto.cuotas = convenio.cuotaConvenio
      ? InstallmentResponseDto.fromRowList(convenio.cuotaConvenio)
      : undefined;
    if (convenio.contrato) {
      dto.numeroGuia = convenio.contrato.numeroGuia;
      const cliente = convenio.contrato.cliente;
      if (cliente) {
        dto.clienteNombre =
          cliente.razonSocial ||
          `${cliente.nombres ?? ''} ${cliente.apellidos ?? ''}`.trim();
        dto.clienteIdentificacion = cliente.identificacion;
        dto.clienteEmail = cliente.email ?? null;
      }
    }
    return dto;
  }

  static fromRowList(rows: AgreementRow[]): AgreementResponseDto[] {
    return rows.map(AgreementResponseDto.fromRow);
  }
}
