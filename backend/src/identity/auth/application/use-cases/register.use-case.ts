import { Injectable } from '@nestjs/common';
import { UserService } from 'src/identity/users/application/user.service';
import type { CreateUserDto } from 'src/identity/users/interfaces/dto/create-user.dto';
import { RegisterDto } from '../../interfaces/dto/register.dto';
import {
  EntityAlreadyExistsException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

/**
 * Caso de uso para registro de nuevos usuarios.
 *
 * @security Issue #194 / OWASP A01:
 * El endpoint que expone este caso de uso (`POST /auth/register`) está estrictamente
 * protegido por `JwtAuthGuard` + `PermissionsGuard` requiriendo el permiso administrativo
 * `users:create`. En el modelo RBAC actual, `users:create` implica confianza total para
 * la provisión y asignación de rol (`rolId`). Si en el futuro se desea granularidad
 * por tiers (e.g. un operador de soporte con `users:create` sin capacidad de elevar roles),
 * se deberá agregar un guard/permiso explícito `users:assign-role`.
 */
@Injectable()
export class RegisterUseCase {
  constructor(private readonly userService: UserService) {}

  async execute(registerDto: RegisterDto) {
    const user = await this.userService.user({ email: registerDto.email });

    if (user) {
      throw new EntityAlreadyExistsException(
        'Usuario',
        'email',
        registerDto.email,
      );
    }

    const createUserData: CreateUserDto = {
      email: registerDto.email,
      nombres: registerDto.nombres,
      apellidos: registerDto.apellidos,
      telefono: registerDto.telefono,
    };

    if (registerDto.rolId) {
      createUserData.rolId = parseInt(registerDto.rolId, 10);
    }

    const newUser = await this.userService.createUser(createUserData);

    if (newUser) {
      return {
        message: 'El registro fue exitoso',
        usuarioId: newUser.usuarioId,
      };
    } else {
      throw new InvalidDomainOperationException(
        'Error al registrar el usuario',
      );
    }
  }
}
