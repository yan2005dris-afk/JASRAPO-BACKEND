export interface ComunidadRef {
  comunidadId: number;
  codigo: string;
  nombre: string;
}

export class SectorEntity {
  constructor(
    public readonly sectorId: number,
    public readonly nombre: string,
    public readonly codigo: string,
    public readonly comunidadId: number | null,
    public readonly comunidades?: ComunidadRef | null,
    public readonly deletedAt: Date | null = null,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}
}
