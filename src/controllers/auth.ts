import { compare, hash } from "bcrypt";
import { Request, Response } from "express";
import { prisma } from "..";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import { AuthenticatedRequest } from "../types";

export async function login(req: Request, res: Response) {
  const user = await prisma.user.findFirst({
    where: {
      email: req.body.email.toLowerCase(),
    },
  });

  if (!user) {
    return res.status(400).send({
      status: 400,
      content: "Invalid email",
    });
  }

  const passwordMatch = await compare(req.body.password, user.password);
  if (!passwordMatch) {
    return res.status(401).send({
      status: 401,
      content: "Invalid password",
    });
  }

  const token = jwt.sign(
    {
      userId: user.id,
    },
    JWT_SECRET
  );

  //   return res.json({ token });
  return res.status(200).send({
    status: 200,
    content: {
      token: token,
      user: {
        id: user.id,
        displayName: user.displayName,
        username: user.username,
        profilePicture: user.profilePicture,
      },
    },
  });
}

export async function signup(req: Request, res: Response) {
  // Check input fields errors
  if (req.body.errors)
    return res.status(406).send({ status: 406, content: req.body.errors });

  // Create User row
  try {
    const newUser = await prisma.user.create({
      data: {
        displayName: req.body.displayName,
        username: req.body.username.toLowerCase(),
        email: req.body.email.toLowerCase(),
        password: await hash(req.body.password, 10),
      },
    });

    return res.status(201).send({
      status: 201,
      //   content: { accountId: newUser.id },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      const target: string[] = error.meta?.target || [];

      let errors: Record<string, string[]> = {};

      target.forEach((field: string) => {
        if (!errors[field]) errors[field] = [];
        errors[field].push(`This ${field} is already taken.`);
      });

      return res.status(409).send({ status: 409, content: errors });
    }
    return res.status(400).send({ status: 400, content: "Sign up failed." });
  }
}

export function logout(req: AuthenticatedRequest, res: Response) {
  // Block token
  res.send("Logout works");
}

export function auth(req: AuthenticatedRequest, res: Response) {
  // Check if token is blocked
  res.status(200).send({
    status: 200,
    content: {
      message: "User authorized.",
      user: {
        id: req.user?.id,
        displayName: req.user?.displayName,
        username: req.user?.username,
        profilePicture: req.user?.profilePicture,
      },
    },
  });
}
