import type { Prisma } from 'src/generated/prisma/client';

/**
 * Default Prisma include usado en cada query del repositorio de Comunidades.
 *
 * Trae la relation `sector` (singular en el modelo `Comunidades`) con
 * `select` limitado a 3 campos. Es la unica relation hidratada porque
 * el BC la expone en el DTO response (`CommunityResponseDto.sectores`).
 * Las otras relations (`contratos`, `lote`, `rutas`) no se hidratan
 * y se mantienen comentadas como punto de extension.
 */
export const communityInclude = {
  sector: {
    select: {
      sectorId: true,
      nombre: true,
      codigo: true,
    },
  },
} as const satisfies Prisma.ComunidadesInclude;

/**
 * Tipo de fila Prisma que el repositorio retorna. Reemplaza al brand
 * `CommunityEntity` (eliminado en #366 Nivel 2): antes era una clase
 * anemica con `Object.assign(this, partial)` que no agregaba
 * comportamiento y obligaba a un mapper ceremonial. Ahora la "entity"
 * es directamente el row de Prisma.
 *
 * El campo hidratado se llama `sector` (singular) en el modelo
 * `Comunidades`, aunque el field publico en el DTO response se llama
 * `sectores` (plural). El mapper del DTO hace el rename a plural.
 */
export type CommunityRow = Prisma.ComunidadesGetPayload<{
  include: typeof communityInclude;
}>;
