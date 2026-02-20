import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CreateUserDto } from './dto/create-user.dto';

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
}
