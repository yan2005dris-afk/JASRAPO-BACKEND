import type { Prisma } from 'src/generated/prisma/client';

export interface IResponseCommunities {
  comunidadId: number;
  nombre: string;
  codigo: string;
  porcentajeTasaSeguridad: number | null;
}

export interface IResponseCommunitiesWithSector {
  comunidadId: number;
  nombre: string;
  codigo: string;
  porcentajeTasaSeguridad: number | null;
  sectores: {
    sectorId: number;
    nombre: string;
    codigo: string;
  }[];
}

export const safeCommunitiesSelect = {
  comunidadId: true,
  nombre: true,
  codigo: true,
  porcentajeTasaSeguridad: true,
} satisfies Prisma.ComunidadesSelect;

export const safeCommunitiesSelectWithDelete = {
  comunidadId: true,
  nombre: true,
  codigo: true,
  porcentajeTasaSeguridad: true,
  deletedAt: true,
} satisfies Prisma.ComunidadesSelect;

export const safeCommunitiesSelectWithTimestamps = {
  comunidadId: true,
  nombre: true,
  codigo: true,
  porcentajeTasaSeguridad: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.ComunidadesSelect;

export const safeCommunitiesSelectWithSector = {
  comunidadId: true,
  nombre: true,
  codigo: true,
  porcentajeTasaSeguridad: true,
  sector: {
    select: {
      sectorId: true,
      nombre: true,
      codigo: true,
    },
  },
} satisfies Prisma.ComunidadesSelect;
