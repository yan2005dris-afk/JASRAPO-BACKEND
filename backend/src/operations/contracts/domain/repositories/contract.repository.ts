import type { ContractEntity } from '../entities/contract.entity';

export abstract class ContractRepository {
  abstract findMany(params: {
    skip?: number;
    take?: number;
    where?: Record<string, any>;
    orderBy?: Record<string, any>;
  }): Promise<ContractEntity[]>;

  abstract findUnique(
    where: Record<string, any>,
  ): Promise<ContractEntity | null>;

  abstract count(params: { where?: Record<string, any> }): Promise<number>;

  abstract update(
    where: Record<string, any>,
    data: Record<string, any>,
  ): Promise<ContractEntity>;

  abstract executeTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T>;
}
