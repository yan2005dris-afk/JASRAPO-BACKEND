import type { CommunityEntity } from '../entities/community.entity';
import type { CreateCommunityData } from '../types/create-community-data';

export abstract class CommunityRepository {
  abstract findUnique(
    where: Record<string, any>,
  ): Promise<CommunityEntity | null>;

  abstract findFirst(
    where: Record<string, any>,
  ): Promise<CommunityEntity | null>;

  abstract findMany(params: {
    where?: Record<string, any>;
    orderBy?: Record<string, any>;
    skip?: number;
    take?: number;
  }): Promise<CommunityEntity[]>;

  abstract count(params?: {
    where?: Record<string, any>;
  }): Promise<number>;

  abstract create(data: CreateCommunityData): Promise<CommunityEntity>;

  abstract update(
    where: Record<string, any>,
    data: Record<string, any>,
  ): Promise<CommunityEntity>;
}
