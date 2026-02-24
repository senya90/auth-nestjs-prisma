/*
  Warnings:

  - Changed the type of `name` on the `permission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `name` on the `roles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('ADMIN', 'MODERATOR', 'SUPPORT', 'GUEST');

-- CreateEnum
CREATE TYPE "PermissionName" AS ENUM ('USER__READ', 'USER__EDIT', 'PERMISSION__ADD', 'PERMISSION__ASSIGN', 'ROLE__ASSIGN', 'TEST__MUTATION', 'TEST__READ');

-- AlterTable
ALTER TABLE "permission" DROP COLUMN "name",
ADD COLUMN     "name" "PermissionName" NOT NULL;

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "name",
ADD COLUMN     "name" "RoleName" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "permission_name_key" ON "permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");
