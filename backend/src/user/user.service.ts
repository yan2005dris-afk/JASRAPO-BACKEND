import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import * as bcrypt from 'bcryptjs';
import { Prisma, user } from 'src/generated/prisma/client';

// Campos seguros para devolver en respuestas (sin password)
const safeUserSelect = {
  userId: true,
  userEmail: true,
  userName: true,
} satisfies Prisma.userSelect;

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async user(userWhereUniqueInput: Prisma.userWhereUniqueInput) {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      select: safeUserSelect,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.userWhereUniqueInput;
    where?: Prisma.userWhereInput;
    orderBy?: Prisma.userOrderByWithRelationInput;
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

  async createUser(dto: Prisma.userCreateInput) {
    return this.prisma.user.create({
      data: {
        userEmail: dto.userEmail,
        userName: dto.userName,
        userPassword: dto.userPassword,
      },
      select: safeUserSelect,
    });
  }

  async updateUser(params: {
    where: Prisma.userWhereUniqueInput;
    data: Prisma.userUpdateInput;
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

  async deleteUser(where: Prisma.userWhereUniqueInput) {
    return this.prisma.user.delete({
      where,
      select: safeUserSelect,
    });
  }
}
