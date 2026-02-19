/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `passwords` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "passwords_user_id_key" ON "passwords"("user_id");
