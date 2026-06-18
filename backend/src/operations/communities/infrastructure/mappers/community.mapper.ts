import { CommunityEntity } from '../../domain/entities/community.entity';

export class CommunityMapper {
  static toDomain(raw: any): CommunityEntity | null {
    if (!raw) return null;

    return new CommunityEntity({
      comunidadId: raw.comunidadId,
      nombre: raw.nombre,
      codigo: raw.codigo,
      porcentajeTasaSeguridad:
        raw.porcentajeTasaSeguridad != null
          ? Number(raw.porcentajeTasaSeguridad)
          : null,
      sectores: raw.sector
        ? raw.sector.map(
            (s: { sectorId: number; nombre: string; codigo: string }) => ({
              sectorId: s.sectorId,
              nombre: s.nombre,
              codigo: s.codigo,
            }),
          )
        : undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  static toDomainList(rawList: any[]): CommunityEntity[] {
    return rawList
      .map((raw) => this.toDomain(raw))
      .filter((item): item is CommunityEntity => item !== null);
  }
}
