/*
  Warnings:

  - The values [FRIENDS] on the enum `RelationshipStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[requesterId,receiverId]` on the table `Relationship` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "sonora"."RelationshipStatus_new" AS ENUM ('PENDING', 'ACCEPTED', 'BLOCKED');
ALTER TABLE "sonora"."Relationship" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "sonora"."Relationship" ALTER COLUMN "status" TYPE "sonora"."RelationshipStatus_new" USING ("status"::text::"sonora"."RelationshipStatus_new");
ALTER TYPE "sonora"."RelationshipStatus" RENAME TO "RelationshipStatus_old";
ALTER TYPE "sonora"."RelationshipStatus_new" RENAME TO "RelationshipStatus";
DROP TYPE "sonora"."RelationshipStatus_old";
ALTER TABLE "sonora"."Relationship" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- CreateIndex
CREATE UNIQUE INDEX "Relationship_requesterId_receiverId_key" ON "sonora"."Relationship"("requesterId", "receiverId");
