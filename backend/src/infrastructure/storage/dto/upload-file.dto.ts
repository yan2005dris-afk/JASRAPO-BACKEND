import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { IsNotEmptyString } from 'src/common/decorators/is-not-empty-string.decorator';

export class UploadFileQueryDto {
  @ApiProperty({
    description:
      'Nombre del bucket de almacenamiento S3 donde se almacenará el archivo. ' +
      'Se crea automáticamente si no existe.',
    example: 'documents',
  })
  @IsNotEmptyString()
  @MaxLength(255)
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
