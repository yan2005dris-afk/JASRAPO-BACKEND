-- CreateTable
CREATE TABLE "sessions" (
    "sessions_id" TEXT NOT NULL,
    "users_id" INTEGER NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("sessions_id")
);

-- CreateIndex
CREATE INDEX "sessions_users_id_idx" ON "sessions"("users_id");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- CreateIndex
CREATE INDEX "sessions_is_revoked_expires_at_idx" ON "sessions"("is_revoked", "expires_at");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("users_id") ON DELETE CASCADE ON UPDATE CASCADE;
