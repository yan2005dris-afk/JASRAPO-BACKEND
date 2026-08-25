-- CreateTable UsuarioInvitacion
CREATE TABLE IF NOT EXISTS "usuarios_invitaciones" (
    "usuario_invitacion_id" SERIAL NOT NULL,
    "usuario_id" INTEGER,
    "token_hash" VARCHAR(255) NOT NULL,
    "expira_en" TIMESTAMP(3) NOT NULL,
    "aceptado_en" TIMESTAMP(3),
    "version_terminos" VARCHAR(10) NOT NULL DEFAULT 'v0',
    "invitado_por_usuario_id" INTEGER,
    "email_enviado_en" TIMESTAMP(3),
    "email_fallido_en" TIMESTAMP(3),
    "email_intentos" INTEGER NOT NULL DEFAULT 0,
    "creado_en" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3),

    CONSTRAINT "usuarios_invitaciones_pkey" PRIMARY KEY ("usuario_invitacion_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_invitaciones_token_hash_key" ON "usuarios_invitaciones"("token_hash");

-- CreateIndex
CREATE INDEX "usuarios_invitaciones_usuario_id_aceptado_en_idx" ON "usuarios_invitaciones"("usuario_id", "aceptado_en");

-- AddForeignKey
ALTER TABLE "usuarios_invitaciones" ADD CONSTRAINT "usuarios_invitaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_invitaciones" ADD CONSTRAINT "usuarios_invitaciones_invitado_por_usuario_id_fkey" FOREIGN KEY ("invitado_por_usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable usuarios: hacer nullable la columna contrasenia
ALTER TABLE "usuarios" ALTER COLUMN "contrasenia" DROP NOT NULL;
