/*
  Warnings:

  - A unique constraint covering the columns `[championId]` on the table `Tournament` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `round` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TournamentRound" AS ENUM ('SEMI_FINAL', 'FINAL');

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "nextRoomId" TEXT,
ADD COLUMN     "round" "TournamentRound" NOT NULL;

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "championId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_championId_key" ON "Tournament"("championId");

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_championId_fkey" FOREIGN KEY ("championId") REFERENCES "RoomParticipant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_nextRoomId_fkey" FOREIGN KEY ("nextRoomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
