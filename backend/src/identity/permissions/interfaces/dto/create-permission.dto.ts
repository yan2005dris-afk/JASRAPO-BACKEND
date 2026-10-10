import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';
import { IsNotEmptyString } from 'src/common/decorators/is-not-empty-string.decorator';

export class CreatePermissionDto {
  @ApiProperty({ example: 'Gestión de usuarios' })
  @IsNotEmptyString()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({
    example: 'Permite crear, leer, actualizar y eliminar usuarios',
  })
  @IsNotEmptyString()
  @MaxLength(255)
  descripcion: string;

  @ApiProperty({ example: 'users' })
  @IsNotEmptyString()
  @MaxLength(100)
  recurso: string;

  @ApiProperty({ example: 'read' })
  @IsNotEmptyString()
  @MaxLength(50)
  accion: string;
}
