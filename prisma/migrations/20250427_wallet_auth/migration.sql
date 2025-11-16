-- CreateEnum for ResourceType and AccessLevel
CREATE TYPE "ResourceType" AS ENUM ('DiagnosticReport', 'Patient', 'Observation', 'MedicationRequest', 'Condition', 'Procedure', 'AllergyIntolerance', 'Immunization', 'Other');
CREATE TYPE "AccessLevel" AS ENUM ('Read', 'Write', 'Full');

-- CreateTable User with wallet authentication
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aadhaarNumber" TEXT,
    "phoneNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable FhirRecord
CREATE TABLE "FhirRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceType" "ResourceType" NOT NULL,
    "fhirData" JSONB NOT NULL,
    "originalFileUrl" TEXT,
    "ipfsHash" TEXT,
    "blockchainTxHash" TEXT,
    "extractedText" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FhirRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable AccessControl
CREATE TABLE "AccessControl" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "granterId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "accessLevel" "AccessLevel" NOT NULL DEFAULT 'Read',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "smartContractAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessControl_pkey" PRIMARY KEY ("id")
);

-- CreateTable AuditLog
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recordId" TEXT,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "blockchainTxHash" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");
CREATE UNIQUE INDEX "User_aadhaarNumber_key" ON "User"("aadhaarNumber");
CREATE INDEX "FhirRecord_userId_idx" ON "FhirRecord"("userId");
CREATE INDEX "FhirRecord_resourceType_idx" ON "FhirRecord"("resourceType");
CREATE INDEX "FhirRecord_createdAt_idx" ON "FhirRecord"("createdAt");
CREATE INDEX "AccessControl_granterId_idx" ON "AccessControl"("granterId");
CREATE INDEX "AccessControl_receiverId_idx" ON "AccessControl"("receiverId");
CREATE INDEX "AccessControl_recordId_idx" ON "AccessControl"("recordId");
CREATE UNIQUE INDEX "AccessControl_recordId_receiverId_key" ON "AccessControl"("recordId", "receiverId");
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_recordId_idx" ON "AuditLog"("recordId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- AddForeignKey
ALTER TABLE "FhirRecord" ADD CONSTRAINT "FhirRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AccessControl" ADD CONSTRAINT "AccessControl_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "FhirRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AccessControl" ADD CONSTRAINT "AccessControl_granterId_fkey" FOREIGN KEY ("granterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AccessControl" ADD CONSTRAINT "AccessControl_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "FhirRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
