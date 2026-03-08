-- Move from users_roles (many-to-many) to users.role_id (single role per user)
ALTER TABLE "users" ADD COLUMN "role_id" INTEGER;

-- Backfill using the first active role assignment per user.
UPDATE "users" u
SET "role_id" = x."role_id"
FROM (
  SELECT DISTINCT ON ("user_id")
    "user_id",
    "role_id"
  FROM "users_roles"
  WHERE "deleted_at" IS NULL
  ORDER BY "user_id", "users_roles_id" ASC
) x
WHERE u."users_id" = x."user_id"
  AND u."role_id" IS NULL;

CREATE INDEX "users_role_id_idx" ON "users"("role_id");

ALTER TABLE "users"
ADD CONSTRAINT "users_role_id_fkey"
FOREIGN KEY ("role_id") REFERENCES "roles"("roles_id")
ON DELETE SET NULL
ON UPDATE CASCADE;

DROP TABLE "users_roles";
