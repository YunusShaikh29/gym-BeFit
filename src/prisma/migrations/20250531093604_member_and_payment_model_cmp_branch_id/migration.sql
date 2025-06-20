/*
  Warnings:

  - You are about to drop the column `cmpID` on the `Company` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[clientCode,branchID]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdById` to the `Member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `membershipDurationMonths` to the `Member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalMembershipAmount` to the `Member` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Company_clientCode_cmpID_key";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "cmpID",
ADD COLUMN     "branchID" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "amountPaid" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN     "createdById" INTEGER NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "membershipDurationMonths" INTEGER NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "totalMembershipAmount" DECIMAL(10,2) NOT NULL;

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "memberId" INTEGER NOT NULL,
    "receivedByUserId" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_clientCode_branchID_key" ON "Company"("clientCode", "branchID");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_receivedByUserId_fkey" FOREIGN KEY ("receivedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
