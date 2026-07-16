-- CreateEnum
CREATE TYPE "Mood" AS ENUM ('Happy', 'Neutral', 'Sad');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('Low', 'Medium', 'High');

-- AlterTable
ALTER TABLE "Diary" ADD COLUMN     "mood" "Mood";

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'Medium';
