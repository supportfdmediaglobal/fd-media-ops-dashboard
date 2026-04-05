-- CreateEnum
CREATE TYPE "AgentActionType" AS ENUM ('EMAIL');

-- CreateTable
CREATE TABLE "AgentRule" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "action" "AgentActionType" NOT NULL DEFAULT 'EMAIL',
    "emailTo" TEXT NOT NULL DEFAULT '',
    "notifyOnOpen" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnResolve" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentRule_serviceId_key" ON "AgentRule"("serviceId");

-- AddForeignKey
ALTER TABLE "AgentRule" ADD CONSTRAINT "AgentRule_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
