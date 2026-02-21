import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/database/prisma.service';
import { UserService } from 'src/user/user.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
  ) {}
  async register({ name, email, password }: RegisterDto) {
    const user = await this.userService.user({ userEmail: email });

    if (user) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const newUser = await this.userService.createUser({
      userName: name,
      userEmail: email,
      userPassword: await bcrypt.hash(password, 10),
    });
    if (newUser) {
      return 'El registro fue exitoso';
    } else {
      throw new BadRequestException('Error al registrar el usuario');
    }
  }

  async login(loginUserDto: LoginUserDto) {
    //Extraer email y password del DTO
    const { userEmail, userPassword } = loginUserDto;

    //Buscar el usuario por email en la base de datos
    const user = await this.prisma.user.findUnique({
      where: { userEmail },
    });

    //Si no se encuentra el usuario, lanzar una excepción de credenciales inválidas
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    //Validación sin encriptar SOLO PARA PRUEBAS
    if (user.userPassword !== userPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    // Validación con bcrypt descomentar al implementar
    /*
    //Se encrypta la contraseña ingresada y se compara con la contraseña hasheada almacenada en la base de datos
    const isPasswordValid = await bcrypt.compare(userPassword, user.userPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    */

    //Extraer usuario seguro sin password para devolver en la respuesta
    const { userPassword: _, ...safeUser } = user; // Excluye el password del objeto de usuario

    //Retornar JWT DESCOMENTAR AL IMPLEMENTAR
    /* 
    const payload = { sub: user.userId, email: user.userEmail };
    const token = this.jwtService.sign(payload);
    return { accessToken: token, user: safeUser };
    */
    
    //Retornar sin JWT SOLO PARA PRUEBAS
    return { message: 'Login successful', user: safeUser };
  }
}
