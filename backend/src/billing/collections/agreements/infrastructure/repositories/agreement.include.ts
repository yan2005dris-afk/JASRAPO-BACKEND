import type { Prisma } from 'src/generated/prisma/client';

/**
 * Default Prisma include usado en cada query del repositorio de Convenios.
 *
 * Trae la relation `cuotaConvenio` (singular en el modelo, array de filas)
 * con `where: { deletedAt: null }` y `orderBy: { numeroCuota: 'asc' }`.
 * Es la unica relation hidratada por default. Si en el futuro un
 * use-case necesita `contrato.cliente` o `contrato.direccionSuministro`,
 * se anade a la query especifica (como hace `getPdfData`).
 */
export const agreementInclude = {
  cuotaConvenio: {
    where: { deletedAt: null },
    orderBy: { numeroCuota: 'asc' as const },
  },
  contrato: {
    select: {
      numeroGuia: true,
      cliente: {
        select: {
          nombres: true,
          apellidos: true,
          razonSocial: true,
          identificacion: true,
          email: true,
        },
      },
    },
  },
} as const satisfies Prisma.ConveniosInclude;

/**
 * Tipo de fila Prisma para Convenio con el include por defecto.
 *
 * Reemplaza al brand `AgreementEntity` (eliminado en #366 Nivel 2):
 * antes era una clase anemica con `Object.assign(this, partial)` que
 * no agregaba comportamiento y obligaba a un mapper ceremonial. Ahora
 * la "entity" es directamente el row de Prisma.
 */
export type AgreementRow = Prisma.ConveniosGetPayload<{
  include: typeof agreementInclude;
}>;

/**
 * Tipo de fila Prisma para CuotaConvenio.
 *
 * Reemplaza al brand `InstallmentEntity` (eliminado en #366 Nivel 2).
 * Derivado del tipo de la relation en `AgreementRow` para que cuando
 * Prisma cambie la forma del modelo `CuotaConvenio`, `CuotaConvenioRow`
 * se actualice automaticamente.
 */
export type CuotaConvenioRow = AgreementRow['cuotaConvenio'][number];
