-- CreateTable
CREATE TABLE "Paste" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'plaintext',
    "expiresAt" TIMESTAMP(3),
    "burnAfterRead" BOOLEAN NOT NULL DEFAULT false,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paste_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Paste_createdAt_idx" ON "Paste"("createdAt");

-- CreateIndex
CREATE INDEX "Paste_expiresAt_idx" ON "Paste"("expiresAt");
