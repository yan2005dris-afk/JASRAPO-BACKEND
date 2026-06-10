import { Prisma } from 'src/generated/prisma/client';

export abstract class AgreementRepository {
  abstract findFirstConvenio(
    where: Prisma.ConveniosWhereInput,
    select?: Prisma.ConveniosSelect,
  ): Promise<any>;

  abstract findUniqueConvenio(
    where: Prisma.ConveniosWhereUniqueInput,
    select?: Prisma.ConveniosSelect,
  ): Promise<any>;

  abstract findManyConvenios(params: {
    select?: Prisma.ConveniosSelect;
    where?: Prisma.ConveniosWhereInput;
    orderBy?: Prisma.ConveniosOrderByWithRelationInput;
    take?: number;
    skip?: number;
  }): Promise<any[]>;

  abstract createConvenio(
    data: Prisma.ConveniosCreateInput,
    select?: Prisma.ConveniosSelect,
  ): Promise<any>;

  abstract updateConvenio(
    where: Prisma.ConveniosWhereUniqueInput,
    data: Prisma.ConveniosUpdateInput,
    select?: Prisma.ConveniosSelect,
  ): Promise<any>;

  abstract findFirstContrato(
    where: Prisma.ContratosWhereInput,
    select?: Prisma.ContratosSelect,
  ): Promise<any>;

  abstract findFirstParametroTasainteres(
    where: Prisma.ParametroTasainteresWhereInput,
    orderBy?: Prisma.ParametroTasainteresOrderByWithRelationInput,
    select?: Prisma.ParametroTasainteresSelect,
  ): Promise<any>;

  abstract findManyPrefacturas(params: {
    where: Prisma.PrefacturasWhereInput;
    select?: Prisma.PrefacturasSelect;
    orderBy?: Prisma.PrefacturasOrderByWithRelationInput;
  }): Promise<any[]>;

  abstract findManyCuotaConvenio(params: {
    where: Prisma.CuotaConvenioWhereInput;
    select?: Prisma.CuotaConvenioSelect;
    orderBy?: Prisma.CuotaConvenioOrderByWithRelationInput;
  }): Promise<any[]>;

  abstract executeTransaction<T>(
    callback: (tx: any) => Promise<T>,
  ): Promise<T>;
}
