/*
  Warnings:

  - You are about to drop the column `amount` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `amountReceived` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `membershipId` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('active');

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "amount",
ADD COLUMN     "amountReceived" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "membershipId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Membership" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "totalPlanAmount" DECIMAL(10,2) NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "finalPayableAmount" DECIMAL(10,2) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "amountPaidByMember" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "balanceRemaining" DECIMAL(10,2) NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'active',
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
