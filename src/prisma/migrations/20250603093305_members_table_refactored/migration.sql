/*
  Warnings:

  - The values [Admin,Manager,Staff] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `amountPaid` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `membershipDurationMonths` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `totalMembershipAmount` on the `Member` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('cash', 'online');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('admin', 'manager', 'staff');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'admin';
COMMIT;

-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "branchID" DROP DEFAULT;
DROP SEQUENCE "Company_branchID_seq";

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "amountPaid",
DROP COLUMN "endDate",
DROP COLUMN "membershipDurationMonths",
DROP COLUMN "startDate",
DROP COLUMN "state",
DROP COLUMN "totalMembershipAmount",
ADD COLUMN     "email" TEXT,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "pincode" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'cash';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'admin';
