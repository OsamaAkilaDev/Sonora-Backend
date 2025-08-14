-- CreateEnum
CREATE TYPE "sonora"."RelationshipStatus" AS ENUM ('PENDING', 'FRIENDS', 'BLOCKED');

-- CreateTable
CREATE TABLE "sonora"."Relationship" (
    "id" TEXT NOT NULL,
    "status" "sonora"."RelationshipStatus" NOT NULL DEFAULT 'PENDING',
    "requesterId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Relationship_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sonora"."Relationship" ADD CONSTRAINT "Relationship_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "sonora"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sonora"."Relationship" ADD CONSTRAINT "Relationship_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "sonora"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
