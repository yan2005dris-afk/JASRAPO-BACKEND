import {
  IsOptional,
  IsObject,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';

export class SignaturePositionDto {
  @ApiPropertyOptional({
    description: 'Página donde colocar la firma (0 = primera, -1 = última)',
  })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ description: 'Posición X en puntos' })
  @IsOptional()
  @IsNumber()
  x?: number;

  @ApiPropertyOptional({ description: 'Posición Y en puntos' })
  @IsOptional()
  @IsNumber()
  y?: number;
}

export class SignPdfDto {
  @ApiProperty({ description: 'Nombre del archivo de certificado P12' })
  @IsNotEmptyString()
  @MaxLength(255)
  certFile: string;

  @ApiProperty({ description: 'Contraseña del certificado' })
  @IsNotEmptyString()
  @MaxLength(128)
  password: string;

  @ApiPropertyOptional({
    description: 'Posición de la firma',
    type: SignaturePositionDto,
  })
  @IsOptional()
  @IsObject()
  @Type(() => SignaturePositionDto)
  position?: SignaturePositionDto;
}

export class GenerateAndSignPdfDto {
  @ApiProperty({ description: 'Datos JSON para el template' })
  @IsObject()
  jsonData: Record<string, unknown>;

  @ApiProperty({ description: 'Nombre del archivo de certificado P12' })
  @IsNotEmptyString()
  @MaxLength(255)
  certFile: string;

  @ApiProperty({ description: 'Contraseña del certificado' })
  @IsNotEmptyString()
  @MaxLength(128)
  password: string;

  @ApiPropertyOptional({
    description: 'Posición de la firma',
    type: SignaturePositionDto,
  })
  @IsOptional()
  @IsObject()
  @Type(() => SignaturePositionDto)
  position?: SignaturePositionDto;
}
