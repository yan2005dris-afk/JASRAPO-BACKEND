-- CreateTable
CREATE TABLE "mail_provider_daily_counts" (
    "provider_name" TEXT NOT NULL,
    "usage_date" DATE NOT NULL,
    "sent_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "mail_provider_daily_counts_pkey" PRIMARY KEY ("provider_name","usage_date")
);
