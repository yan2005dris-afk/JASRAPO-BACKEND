export interface CommunitySector {
  sectorId: number;
  nombre: string;
  codigo: string;
}

export class CommunityEntity {
  comunidadId: number;
  nombre: string;
  codigo: string;
  porcentajeTasaSeguridad: number | null;
  sectores?: CommunitySector[];
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<CommunityEntity>) {
    Object.assign(this, partial);
  }
}
