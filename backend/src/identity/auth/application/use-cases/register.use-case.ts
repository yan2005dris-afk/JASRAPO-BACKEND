import { Injectable } from '@nestjs/common';
import { UserService } from 'src/identity/users/application/user.service';
import { RegisterDto } from '../../interfaces/dto/register.dto';
import {
  EntityAlreadyExistsException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

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

    const createUserData: any = {
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
      throw new InvalidDomainOperationException('Error al registrar el usuario');
    }
  }
}
