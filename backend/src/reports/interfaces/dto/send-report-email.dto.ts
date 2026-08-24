import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';
import { IsValidDateRange } from 'src/infrastructure/common/decorators/is-valid-date-range.decorator';

/**
 * Shared body for every POST /reports/.../email endpoint.
 *
 * Holds the email-specific overrides plus the polymorphic resource id fields.
 * Each route's controller validates which id (if any) is required:
 *
 *   - `clienteId`  → POST /reports/payments-report/email   (required)
 *   - `contratoId` → POST /reports/connection-history/email (required)
 *   - `contratoId` → POST /reports/account-statement/email  (required)
 *   - `convenioId` → POST /reports/payment-agreement/email  (required)
 *   - none         → POST /reports/clients/email           (no id; uses filtros + destinatario override)
 *
 * All ids are strings (BigInt serialized to base10 string) so JSON doesn't lose
 * precision. They are optional at the DTO layer — required-field validation
 * happens in the controller (each route knows which id it needs).
 *
 * `destinatario` and `subject` are always optional overrides at the DTO
 * layer; for `clients/email` the controller additionally enforces
 * `destinatario` presence at runtime since there is no resource-derived
 * recipient for the client listing.
 */
export class SendReportEmailDto {
  @ApiPropertyOptional({
    description:
      'Fecha inicial del reporte (mismo filtro que el endpoint GET).',
  })
  @IsOptional()
  @IsString()
  @IsValidDateRange()
  @Transform(({ value }) => (value === '' ? undefined : value))
  fechaDesde?: string;

  @ApiPropertyOptional({
    description: 'Fecha final del reporte (mismo filtro que el endpoint GET).',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  fechaHasta?: string;

  @ApiPropertyOptional({
    description:
      'ID del cliente (BigInt como string). Requerido para POST /reports/payments-report/email.',
  })
  @IsOptional()
  @IsNotEmptyString()
  clienteId?: string;

  @ApiPropertyOptional({
    description:
      'ID del contrato (BigInt como string). Requerido para POST /reports/connection-history/email y /reports/account-statement/email.',
  })
  @IsOptional()
  @IsNotEmptyString()
  contratoId?: string;

  @ApiPropertyOptional({
    description:
      'ID del convenio de pago (BigInt como string). Requerido para POST /reports/payment-agreement/email.',
  })
  @IsOptional()
  @IsNotEmptyString()
  convenioId?: string;

  @ApiPropertyOptional({
    description:
      'Override recipient email. Defaults to the email derived from the report spec. Required para POST /reports/clients/email (no recipient derivable).',
  })
  @IsOptional()
  @IsEmail({}, { message: 'destinatario must be a valid email address' })
  @MaxLength(255, { message: 'destinatario must not exceed 255 characters' })
  destinatario?: string;

  @ApiPropertyOptional({
    description:
      'Override email subject. Defaults to the strategy-built subject.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'subject must not exceed 255 characters' })
  subject?: string;
}
