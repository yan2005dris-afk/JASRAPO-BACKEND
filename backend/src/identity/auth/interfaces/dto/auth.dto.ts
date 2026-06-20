import {
  IsEmail,
  MinLength,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';

export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export class LoginDto {
  @ApiProperty({ example: 'admin@empresa.com' })
  @IsEmail({}, { message: 'El email no es válido' })
  @IsNotEmptyString()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmptyString()
  @MaxLength(128)
  password: string;
}

export class RegisterUserDto {
  @ApiProperty({ example: 'admin@empresa.com' })
  @IsEmail({}, { message: 'El email no es válido' })
  @IsNotEmptyString()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
  @IsNotEmptyString()
  @MaxLength(128)
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @ApiProperty({ enum: UserRole, default: UserRole.USER })
  @IsEnum(UserRole)
  @IsOptional()
  rol?: UserRole;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmptyString()
  @MaxLength(128)
  currentPassword: string;

  @ApiProperty({ minLength: 8 })
  @IsNotEmptyString()
  @MaxLength(128)
  @MinLength(8)
  newPassword: string;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType: string;

  @ApiProperty({
    description: 'Segundos restantes para la expiración del accessToken',
    example: 3600,
  })
  expiresIn: number;

  @ApiProperty({
    description: 'Timestamp exacto de expiración',
    example: '2026-05-02T12:00:00.000Z',
  })
  expiresAt: string;

  @ApiProperty()
  user: {
    id: string;
    email: string;
    rol: string;
  };
}

export class JwtPayload {
  sub: string | number;
  email: string;
  rol: UserRole;
  type?: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'El refresh token obtenido en el login' })
  @IsNotEmptyString()
  @MaxLength(500)
  refreshToken: string;
}
