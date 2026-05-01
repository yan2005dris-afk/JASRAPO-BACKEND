import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(createUsersDto: CreateUserDto) {
    const userRole = await this.prisma.roles.findFirst({
      where: { name: 'user' },
    });
    if (!userRole) {
      throw new Error('No existe el rol por defecto "user".');
    }

    const hashedPassword = await bcrypt.hash(createUsersDto.password, 10);

    const newUser = await this.prisma.users.create({
      data: {
        email: createUsersDto.email,
        password: hashedPassword,
        rolesId: userRole.rolesId,
      },
    });

    await this.prisma.profiles.create({
      data: { usersId: newUser.usersId },
    });

    return {
      usersId: newUser.usersId,
      email: newUser.email,
    };
  }
}
