-- AlterTable
ALTER TABLE "verification_tokens" ADD COLUMN     "revoked" BOOLEAN NOT NULL DEFAULT false;
