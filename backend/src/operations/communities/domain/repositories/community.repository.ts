import type { CommunityRow } from '../types/community.types';
import type {
  CreateCommunityData,
  UpdateCommunityData,
  CommunityFilters,
} from '../types/community.types';

export abstract class CommunityRepository {
  abstract findById(
    id: number,
    includeDeleted?: boolean,
  ): Promise<CommunityRow | null>;

  abstract findByCodigo(codigo: string): Promise<CommunityRow | null>;

  abstract findActiveByNameOrCode(
    nombre: string,
    codigo: string,
  ): Promise<CommunityRow | null>;

  abstract paginate(
    filters: CommunityFilters,
    pagination: { skip: number; take: number },
  ): Promise<{ data: CommunityRow[]; total: number }>;

  abstract create(data: CreateCommunityData): Promise<CommunityRow>;

  abstract update(id: number, data: UpdateCommunityData): Promise<CommunityRow>;

  abstract reactivate(
    id: number,
    data: Partial<CreateCommunityData>,
  ): Promise<CommunityRow>;

  abstract softDelete(id: number): Promise<CommunityRow>;
}
