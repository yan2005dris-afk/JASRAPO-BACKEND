import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ContractProcedureDto {
  @ApiPropertyOptional({
    type: Boolean,
    description: 'Quien realiza el tr\u00e1mite es el titular del contrato',
  })
  @IsOptional()
  @IsBoolean()
  tramitadorEsTitular?: boolean;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Nombre de quien tramita cuando no es el titular',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  tramitadorNombre?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Identificaci\u00f3n de quien tramita',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  tramitadorIdentificacion?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Relaci\u00f3n con el titular',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  relacionTramitador?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Observaciones del tr\u00e1mite',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observacionesTramite?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Otras novedades indicadas por el usuario',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  otrasNovedades?: string | null;
}
