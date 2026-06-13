import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UploadFileQueryDto {
  @ApiProperty({
    description:
      'Nombre del bucket de almacenamiento S3 donde se almacenará el archivo. ' +
      'Se crea automáticamente si no existe.',
    example: 'documents',
  })
  @IsString()
  @IsNotEmpty()
  bucket: string;

  @ApiPropertyOptional({
    description:
      'Subdirectorio (prefijo) dentro del bucket. ' +
      'Permite organizar archivos en carpetas lógicas.',
    example: 'contratos/2026',
  })
  @IsOptional()
  @IsString()
  folder?: string;
}
