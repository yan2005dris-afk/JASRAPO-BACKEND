import type { Comunidades, Sectores } from 'src/generated/prisma/client';
import type {
  IResponseCommunities,
  IResponseCommunitiesWithSector,
} from './IResponseCommunities';

type ComunidadesBasic = Pick<
  Comunidades,
  'comunidadId' | 'nombre' | 'codigo' | 'porcentajeTasaSeguridad'
>;
type ComunidadesWithTimestamps = ComunidadesBasic & {
  createdAt: Date;
  updatedAt: Date;
};

type ComunidadesWithSector = ComunidadesBasic & {
  sector: Pick<Sectores, 'sectorId' | 'nombre' | 'codigo'>[];
};

export function toComunidadResponse(
  comunidad:
    | ComunidadesBasic
    | ComunidadesWithTimestamps
    | ComunidadesWithSector,
): IResponseCommunities | IResponseCommunitiesWithSector {
  if ('sector' in comunidad && comunidad.sector) {
    return {
      comunidadId: comunidad.comunidadId,
      nombre: comunidad.nombre,
      codigo: comunidad.codigo,
      porcentajeTasaSeguridad: comunidad.porcentajeTasaSeguridad
        ? Number(comunidad.porcentajeTasaSeguridad)
        : null,
      sectores: comunidad.sector.map((s) => ({
        sectorId: s.sectorId,
        nombre: s.nombre,
        codigo: s.codigo,
      })),
    };
  }

  // Sin sectores
  return {
    comunidadId: comunidad.comunidadId,
    nombre: comunidad.nombre,
    codigo: comunidad.codigo,
    porcentajeTasaSeguridad: comunidad.porcentajeTasaSeguridad
      ? Number(comunidad.porcentajeTasaSeguridad)
      : null,
  };
}
