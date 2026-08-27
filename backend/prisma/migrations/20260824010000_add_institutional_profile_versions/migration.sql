CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE "perfiles_institucionales" (
    "perfil_institucional_id" BIGSERIAL NOT NULL,
    "emisor_id" INTEGER NOT NULL,
    "version" VARCHAR(64) NOT NULL,
    "vigente_desde" TIMESTAMPTZ NOT NULL,
    "vigente_hasta" TIMESTAMPTZ,
    "siglas" VARCHAR(32) NOT NULL,
    "decreto_numero" TEXT,
    "decreto_fecha" DATE,
    "registro_oficial_numero" TEXT,
    "registro_oficial_fecha" DATE,
    "fecha_fundacion" DATE,
    "ubicacion" JSONB NOT NULL,
    "correo" TEXT NOT NULL,
    "telefonos" JSONB NOT NULL,
    "representantes" JSONB NOT NULL,
    "logo_referencia" JSONB NOT NULL,
    "marca_agua_referencia" JSONB NOT NULL,
    "textos_legales" JSONB NOT NULL,
    "creado_por" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "perfiles_institucionales_pkey" PRIMARY KEY ("perfil_institucional_id"),
    CONSTRAINT "perfiles_institucionales_emisor_id_fkey" FOREIGN KEY ("emisor_id") REFERENCES "emisores"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "perfiles_institucionales_vigencia_valida" CHECK (
        "vigente_hasta" IS NULL OR "vigente_hasta" > "vigente_desde"
    )
);

CREATE UNIQUE INDEX "perfiles_institucionales_version_key"
    ON "perfiles_institucionales"("version");

CREATE INDEX "perfiles_institucionales_emisor_id_idx"
    ON "perfiles_institucionales"("emisor_id");

CREATE INDEX "perfiles_institucionales_vigencia_idx"
    ON "perfiles_institucionales"("vigente_desde", "vigente_hasta");

ALTER TABLE "perfiles_institucionales"
    ADD CONSTRAINT "perfiles_institucionales_vigencia_sin_superposicion"
    EXCLUDE USING gist (
        "emisor_id" WITH =,
        tstzrange(
            "vigente_desde",
            COALESCE("vigente_hasta", 'infinity'::timestamptz),
            '[)'
        ) WITH &&
    );

COMMENT ON TABLE "perfiles_institucionales" IS
    'Versiones auditables de branding, identidad y textos legales usados por documentos oficiales.';

COMMENT ON CONSTRAINT "perfiles_institucionales_vigencia_sin_superposicion"
    ON "perfiles_institucionales" IS
    'Impide que dos perfiles institucionales para el mismo emisor sean válidos para el mismo instante.';
