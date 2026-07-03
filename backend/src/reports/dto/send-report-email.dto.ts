import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Shared body for every POST /reports/.../email endpoint.
 *
 * Both fields are optional at the DTO layer:
 *   - `destinatario` overrides the recipient resolved by the route's strategy.
 *   - `subject` overrides the default subject built by the route's strategy.
 *
 * Per-route DTOs (built in PR 3) extend this with their own required id filters.
 */
export class SendReportEmailDto {
  @ApiPropertyOptional({
    description:
      'Override recipient email. Defaults to the email derived from the report spec.',
  })
  @IsOptional()
  @IsEmail({}, { message: 'destinatario must be a valid email address' })
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
