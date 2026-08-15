export interface CommunityFilters {
  codigo?: string;
  nombre?: string;
  search?: string;
  activo?: boolean;
}

export interface CreateCommunityData {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  activo?: boolean;
}

export interface UpdateCommunityData {
  codigo?: string;
  nombre?: string;
  descripcion?: string | null;
  activo?: boolean;
  deletedAt?: Date | null;
}
