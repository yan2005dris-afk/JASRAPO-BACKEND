import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CreateUserDto } from './dto/create-user.dto';

// Campos seguros para devolver en respuestas (sin password)
const safeUserSelect = {
  usersId: true,
  email: true,
} satisfies Prisma.UsersSelect;

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async user(userWhereUniqueInput: Prisma.UsersWhereUniqueInput) {
    return this.prisma.users.findUnique({
      where: userWhereUniqueInput,
      select: safeUserSelect,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UsersWhereUniqueInput;
    where?: Prisma.UsersWhereInput;
    orderBy?: Prisma.UsersOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.users.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      select: safeUserSelect,
    });
  }

  async createUser(createUsersDto: CreateUserDto) {
    // Buscar el rol 'user' por nombre
    const userRole = await this.prisma.roles.findFirst({
      where: { name: 'user' },
    });

    if (!userRole) {
      throw new Error('No existe el rol por defecto "user".');
    }

    // Crear el usuario
    const newUser = await this.prisma.users.create({
      data: {
        email: createUsersDto.email,
        password: createUsersDto.password,
      },
    });

    // Asignar el rol 'user' al usuario recién creado
    await this.prisma.userRoles.create({
      data: {
        usersId: newUser.usersId,
        rolesId: userRole.rolesId,
      },
    });

    // Retornar el usuario seguro
    return {
      usersId: newUser.usersId,
      email: newUser.email,
    };
  }

  async updateUser(params: {
    where: Prisma.UsersWhereUniqueInput;
    data: Prisma.UsersUpdateInput;
  }) {
    const updateData = { ...params.data };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(
        updateData.password as string,
        10,
      );
    }
    return this.prisma.users.update({
      where: params.where,
      data: updateData,
      select: safeUserSelect,
    });
  }

  async updateUserRole(params: {
    usersRolesId: number;
    rolesId: number;
    deletedAt?: Date;
  }) {
    return this.prisma.userRoles.update({
      where: { usersRolesId: params.usersRolesId },
      data: {
        rolesId: params.rolesId,
        deletedAt: params.deletedAt ?? undefined,
      },
    });
  }

  async deleteUser(where: Prisma.UsersWhereUniqueInput) {
    return this.prisma.users.delete({
      where,
      select: safeUserSelect,
    });
  }
}
