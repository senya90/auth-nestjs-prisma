/*
  Warnings:

  - A unique constraint covering the columns `[name_new]` on the table `permission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name_new]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name_new` to the `permission` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `name` on the `permission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `name_new` to the `roles` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `name` on the `roles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "permission" ADD COLUMN     "name_new" "PermissionName" NOT NULL,
DROP COLUMN "name",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "name_new" "RoleName" NOT NULL,
DROP COLUMN "name",
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "permission_name_key" ON "permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permission_name_new_key" ON "permission"("name_new");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_new_key" ON "roles"("name_new");
