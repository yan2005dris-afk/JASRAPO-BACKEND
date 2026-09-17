import { PrismaClient } from 'src/generated/prisma/client';

export const CORE_TIPOS_ACTIVIDAD = [
  { codigo: 'LECTURA', nombre: 'Lectura' },
  { codigo: 'INSPECCION', nombre: 'Inspección' },
  { codigo: 'INSTALACION', nombre: 'Instalación' },
  { codigo: 'CORTE', nombre: 'Corte' },
  { codigo: 'RECONEXION', nombre: 'Reconexión' },
] as const;

export async function seedTiposActividad(prisma: PrismaClient) {
  for (const tipoActividad of CORE_TIPOS_ACTIVIDAD) {
    await prisma.tipoActividad.upsert({
      where: { codigo: tipoActividad.codigo },
      update: { nombre: tipoActividad.nombre, activo: true },
      create: tipoActividad,
    });
  }
}
