import { Prisma } from 'src/generated/prisma/client';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';

export abstract class UserRepository {
  abstract findUnique(
    where: Prisma.UsuariosWhereUniqueInput,
    select?: Prisma.UsuariosSelect,
  ): Promise<any>;

  abstract findFirst(
    where: Prisma.UsuariosWhereInput,
    select?: Prisma.UsuariosSelect,
  ): Promise<any>;

  abstract findMany(params: {
    select?: Prisma.UsuariosSelect;
    where?: Prisma.UsuariosWhereInput;
    orderBy?: Prisma.UsuariosOrderByWithRelationInput;
    take?: number;
    skip?: number;
  }): Promise<any[]>;

  abstract findManyActive(
    pagination: PaginationDto,
    select?: Prisma.UsuariosSelect,
  ): Promise<{ data: any[]; meta: any }>;

  abstract count(params: { where?: Prisma.UsuariosWhereInput }): Promise<number>;

  abstract create(data: Prisma.UsuariosCreateInput | Prisma.UsuariosUncheckedCreateInput): Promise<any>;

  abstract update(
    where: Prisma.UsuariosWhereUniqueInput,
    data: Prisma.UsuariosUpdateInput | Prisma.UsuariosUncheckedUpdateInput,
    tx?: any,
  ): Promise<any>;

  abstract findRoleById(rolId: number): Promise<any>;

  abstract findRoleByName(nombre: string): Promise<any>;

  abstract findDirectPermissions(usuarioId: number): Promise<any[]>;

  abstract findRolePermissions(rolId: number): Promise<any[]>;

  abstract updatePermissions(
    usuarioId: number,
    permissions: { permisoId: number; permitido?: boolean }[],
    tx?: any,
  ): Promise<void>;

  abstract executeTransaction<T>(
    callback: (tx: any) => Promise<T>,
  ): Promise<T>;
}
