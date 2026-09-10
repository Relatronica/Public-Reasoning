-- CreateTable
CREATE TABLE "curator_store" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curator_store_pkey" PRIMARY KEY ("id")
);
