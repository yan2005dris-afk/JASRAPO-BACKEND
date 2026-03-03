import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProfileDto {
  @ApiPropertyOptional({ description: 'Nombre del usuario', example: 'Juan' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ description: 'Apellido del usuario', example: 'Pérez' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ description: 'Teléfono del usuario', example: '+593987654321' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: 'URL del avatar del usuario', example: 'https://example.com/avatar.png' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string;
}
