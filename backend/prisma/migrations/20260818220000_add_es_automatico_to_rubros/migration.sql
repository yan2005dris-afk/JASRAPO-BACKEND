-- Migration: Add es_automatico column to rubros
-- Created: 2026-08-18
--
-- Changes:
--   1. Agrega la columna es_automatico a la tabla rubros
--      (campo faltante en DB que ya existe en el schema de Prisma)

ALTER TABLE "rubros"
ADD COLUMN IF NOT EXISTS "es_automatico" BOOLEAN NOT NULL DEFAULT false;
