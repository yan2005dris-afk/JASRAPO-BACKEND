import { PartialType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { CreateMeterDto } from './create-meter.dto';
import { EstadoMedidor } from 'src/shared/enums';

export class UpdateMeterDto extends PartialType(CreateMeterDto) {
  @IsOptional()
  @IsEnum(EstadoMedidor)
  estado?: EstadoMedidor;

  @IsOptional()
  @IsString()
  fechaInstalacion?: string | Date;

  @IsOptional()
  @IsDateString()
  fechaBaja?: string | Date;

  @IsOptional()
  @IsString()
  motivo?: string;
}
