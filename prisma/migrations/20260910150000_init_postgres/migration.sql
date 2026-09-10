-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_acts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "actNumber" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "entityType" TEXT NOT NULL DEFAULT 'comune',
    "location" TEXT,
    "region" TEXT DEFAULT 'Lombardia',
    "province" TEXT DEFAULT 'MI',
    "city" TEXT DEFAULT 'Cormano',
    "date" TIMESTAMP(3) NOT NULL,
    "officialUrl" TEXT,
    "rawTextExcerpt" TEXT,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "public_acts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reasoning_records" (
    "id" TEXT NOT NULL,
    "publicActId" TEXT NOT NULL,
    "compilerId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'published',
    "realQuestion" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "uncertaintyLevel" TEXT NOT NULL DEFAULT 'medio',
    "uncertaintyExplanation" TEXT NOT NULL,
    "mindChangingConditions" TEXT NOT NULL,
    "interpretativeSummary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reasoning_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discarded_options" (
    "id" TEXT NOT NULL,
    "reasoningRecordId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reasonDiscarded" TEXT NOT NULL,
    "evidenceType" TEXT NOT NULL DEFAULT 'interpretation',

    CONSTRAINT "discarded_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verbatim_quotes" (
    "id" TEXT NOT NULL,
    "reasoningRecordId" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "pageOrParagraph" TEXT,
    "speaker" TEXT,

    CONSTRAINT "verbatim_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outcome_reviews" (
    "id" TEXT NOT NULL,
    "reasoningRecordId" TEXT NOT NULL,
    "timeframe" TEXT NOT NULL,
    "expectedOutcome" TEXT NOT NULL,
    "actualOutcome" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewDate" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "outcome_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curator_store" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curator_store_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "public_acts_slug_key" ON "public_acts"("slug");

-- CreateIndex
CREATE INDEX "reasoning_records_publicActId_idx" ON "reasoning_records"("publicActId");

-- CreateIndex
CREATE INDEX "reasoning_records_compilerId_idx" ON "reasoning_records"("compilerId");

-- CreateIndex
CREATE INDEX "discarded_options_reasoningRecordId_idx" ON "discarded_options"("reasoningRecordId");

-- CreateIndex
CREATE INDEX "verbatim_quotes_reasoningRecordId_idx" ON "verbatim_quotes"("reasoningRecordId");

-- CreateIndex
CREATE INDEX "outcome_reviews_reasoningRecordId_idx" ON "outcome_reviews"("reasoningRecordId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reasoning_records" ADD CONSTRAINT "reasoning_records_publicActId_fkey" FOREIGN KEY ("publicActId") REFERENCES "public_acts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reasoning_records" ADD CONSTRAINT "reasoning_records_compilerId_fkey" FOREIGN KEY ("compilerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discarded_options" ADD CONSTRAINT "discarded_options_reasoningRecordId_fkey" FOREIGN KEY ("reasoningRecordId") REFERENCES "reasoning_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verbatim_quotes" ADD CONSTRAINT "verbatim_quotes_reasoningRecordId_fkey" FOREIGN KEY ("reasoningRecordId") REFERENCES "reasoning_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outcome_reviews" ADD CONSTRAINT "outcome_reviews_reasoningRecordId_fkey" FOREIGN KEY ("reasoningRecordId") REFERENCES "reasoning_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
