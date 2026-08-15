import type { CommunityEntity } from '../entities/community.entity';
import type {
  CreateCommunityData,
  UpdateCommunityData,
  CommunityFilters,
} from '../types/community.types';

export abstract class CommunityRepository {
  abstract findById(
    id: number,
    includeDeleted?: boolean,
  ): Promise<CommunityEntity | null>;

  abstract findByCodigo(codigo: string): Promise<CommunityEntity | null>;

  abstract findActiveByNameOrCode(
    nombre: string,
    codigo: string,
  ): Promise<CommunityEntity | null>;

  abstract paginate(
    filters: CommunityFilters,
    pagination: { skip: number; take: number },
  ): Promise<{ data: CommunityEntity[]; total: number }>;

  abstract create(data: CreateCommunityData): Promise<CommunityEntity>;

  abstract update(
    id: number,
    data: UpdateCommunityData,
  ): Promise<CommunityEntity>;

  abstract reactivate(
    id: number,
    data: Partial<CreateCommunityData>,
  ): Promise<CommunityEntity>;

  abstract softDelete(id: number): Promise<CommunityEntity>;
}
