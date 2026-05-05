import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(createUsersDto: CreateUserDto) {
    const userRole = await this.prisma.roles.findFirst({
      where: { nombre: 'user' },
    });
    if (!userRole) {
      throw new Error('No existe el rol por defecto "user".');
    }

    const hashedPassword = await bcrypt.hash(createUsersDto.clave, 10);

    const newUser = await this.prisma.usuarios.create({
      data: {
        email: createUsersDto.email,
        clave: hashedPassword,
        rolId: userRole.rolId,
      },
    });

    await this.prisma.perfiles.create({
      data: { usuarioId: newUser.usuarioId },
    });

    return {
      usuarioId: newUser.usuarioId,
      email: newUser.email,
    };
  }
}
