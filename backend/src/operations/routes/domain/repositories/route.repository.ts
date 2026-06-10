import { Prisma } from 'src/generated/prisma/client';
import { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';

export abstract class RouteRepository {
  abstract findUnique(where: Prisma.RutasWhereUniqueInput): Promise<any>;

  abstract findMany(params: {
    where?: Prisma.RutasWhereInput;
    orderBy?: Prisma.RutasOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }): Promise<any[]>;

  abstract paginateRutas(
    args: { where?: Prisma.RutasWhereInput; orderBy?: any },
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<any>>;

  abstract create(data: Prisma.RutasCreateInput): Promise<any>;

  abstract update(
    where: Prisma.RutasWhereUniqueInput,
    data: Prisma.RutasUpdateInput,
  ): Promise<any>;

  abstract findUsuario(where: Prisma.UsuariosWhereUniqueInput, options?: { include?: Prisma.UsuariosInclude }): Promise<any>;

  abstract findComunidad(where: Prisma.ComunidadesWhereUniqueInput): Promise<any>;

  abstract findSector(where: Prisma.SectoresWhereUniqueInput): Promise<any>;

  abstract paginateLecturas(
    args: { where?: Prisma.LecturasWhereInput; include?: Prisma.LecturasInclude; orderBy?: any },
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<any>>;
}
