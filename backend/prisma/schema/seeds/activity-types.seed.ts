import { PrismaClient } from 'src/generated/prisma/client';

export const CORE_ACTIVITY_TYPES = [
  { codigo: 'LECTURA', nombre: 'Lectura' },
  { codigo: 'INSPECCION', nombre: 'Inspección' },
  { codigo: 'INSTALACION', nombre: 'Instalación' },
  { codigo: 'CORTE', nombre: 'Corte' },
  { codigo: 'RECONEXION', nombre: 'Reconexión' },
] as const;

export async function seedActivityTypes(prisma: PrismaClient) {
  for (const activityType of CORE_ACTIVITY_TYPES) {
    await prisma.activityType.upsert({
      where: { codigo: activityType.codigo },
      update: { nombre: activityType.nombre, activo: true },
      create: activityType,
    });
  }
}
