import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import { prisma } from "..";

export async function getUser(
  req: AuthenticatedRequest,
  res: Response,
  next: any
) {
  const username = req.body.username;

  if (!username)
    return res.status(404).send({ status: 404, content: "Invalid username" });

  const user = await prisma.user.findUnique({
    where: { username: username },
  });

  if (!user)
    return res.status(404).send({ status: 404, content: "Invalid username" });

  req.body.targetUser = user;

  next();
}
