-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('waiting', 'playing', 'round_over', 'game_over');

-- CreateEnum
CREATE TYPE "SeatPosition" AS ENUM ('bottom', 'left', 'top', 'right');

-- CreateEnum
CREATE TYPE "Team" AS ENUM ('team1', 'team2');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'waiting',
    "gameState" JSONB,
    "targetScore" INTEGER NOT NULL DEFAULT 100,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSeat" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "seat" "SeatPosition" NOT NULL,
    "playerId" TEXT,
    "playerName" TEXT NOT NULL,
    "team" "Team" NOT NULL,
    "isAi" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameSeat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Game_code_key" ON "Game"("code");

-- CreateIndex
CREATE INDEX "Game_ownerId_idx" ON "Game"("ownerId");

-- CreateIndex
CREATE INDEX "GameSeat_gameId_idx" ON "GameSeat"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "GameSeat_gameId_seat_key" ON "GameSeat"("gameId", "seat");

-- CreateIndex
CREATE UNIQUE INDEX "GameSeat_gameId_playerId_key" ON "GameSeat"("gameId", "playerId");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSeat" ADD CONSTRAINT "GameSeat_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSeat" ADD CONSTRAINT "GameSeat_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
