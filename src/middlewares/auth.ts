import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import { prisma } from "..";
import { AuthenticatedRequest } from "../types";

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: () => any
) {
  // Debug log: print all incoming cookies
  //   const authHeader = req.headers["authorization"];
  const token: string = req.cookies.token;

  if (!token) {
    return res.status(401).send({ status: 401, content: "Token not found." });
  }

  try {
    const decoded = await jwt.verify(token, JWT_SECRET);

    if (!decoded)
      return res.status(403).send({ status: 403, content: "Invalid Token." });

    if (typeof decoded === "string" || !("userId" in decoded)) {
      return res.status(403).json({ error: "Invalid token payload" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user)
      return res.status(403).send({ status: 403, content: "Invalid Token." });

    req.user = user;
    next();
    //
  } catch (err) {
    return res.status(403).send({ status: 403, content: "Invalid Token." });
  }
}
