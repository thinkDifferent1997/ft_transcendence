-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "winnerParticipantId" TEXT;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_winnerParticipantId_fkey" FOREIGN KEY ("winnerParticipantId") REFERENCES "RoomParticipant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
