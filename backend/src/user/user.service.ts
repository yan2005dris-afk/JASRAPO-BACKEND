import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

// Campos seguros para devolver en respuestas (sin password)
const safeUserSelect = {
  userId: true,
  userEmail: true,
  userName: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async user(userWhereUniqueInput: Prisma.UserWhereUniqueInput) {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      select: safeUserSelect,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      select: safeUserSelect,
    });
  }

  async createUser(dto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        userEmail: dto.userEmail,
        userName: dto.userName,
        userPassword: dto.userPassword,
        perfil: {
          connect: { perfilId: dto.perfilId }
        },
      },
      select: safeUserSelect,
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }) {
    const updateData = { ...params.data };

    if (updateData.userPassword) {
      updateData.userPassword = await bcrypt.hash(
        updateData.userPassword as string,
        10,
      );
    }
    return this.prisma.user.update({
      where: params.where,
      data: updateData,
      select: safeUserSelect,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput) {
    return this.prisma.user.delete({
      where,
      select: safeUserSelect,
    });
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
