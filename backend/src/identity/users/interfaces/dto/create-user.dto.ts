import {
  IsEmail,
  IsOptional,
  IsObject,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Prisma } from 'src/generated/prisma/client';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';
import { UserResponseDto } from './user-response.dto';

export class CreateUserDto extends OmitType(UserResponseDto, [
  'usuarioId',
  'rol',
  'avatar',
] as const) {
  @IsEmail()
  @IsNotEmptyString()
  @MaxLength(255)
  email: string;

  @IsNotEmptyString()
  @MaxLength(100)
  nombres: string;

  @IsNotEmptyString()
  @MaxLength(100)
  apellidos: string;

  @IsNotEmptyString()
  @MaxLength(20)
  telefono: string;

  @IsOptional()
  @IsObject()
  avatar?: Prisma.InputJsonValue;

  @ApiProperty({
    description:
      'ID del rol a asignar (opcional). Si no se envía, se asigna el rol "user" por defecto',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  rolId?: number;
}
