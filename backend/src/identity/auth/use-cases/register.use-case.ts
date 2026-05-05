import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserService } from 'src/identity/users/user.service';
import { RegisterDto } from '../dto/register.dto';

@Injectable()
export class RegisterUseCase {
  constructor(private readonly userService: UserService) {}

  /**
   * Registra un nuevo usuario
   * @param email correo del usuario
   * @param password contraseña del usuario
   * @returns mensaje de éxito o lanza excepción si el correo ya existe
   */
  async execute({ email, password }: RegisterDto) {
    const user = await this.userService.user({ email });

    if (user) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const newUser = await this.userService.createUser({
      email,
      clave: await bcrypt.hash(password, 10),
    });

    if (newUser) {
      return 'El registro fue exitoso';
    } else {
      throw new BadRequestException('Error al registrar el usuario');
    }
  }
}
