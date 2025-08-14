-- CreateTable
CREATE TABLE "sonora"."User" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "profilePicture" TEXT NOT NULL,
    "bannerPicture" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userName_key" ON "sonora"."User"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "sonora"."User"("email");
