import { compare, hash } from "bcryptjs";
import { Request, Response } from "express";
import { prisma } from "..";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET, NODE_ENV } from "../secrets";
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

  res.cookie("token", token, {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

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
        profilePicture: `https://api.dicebear.com/9.x/initials/png?seed=${
          req.body.displayName
        }&backgroundColor=${
          colors[Math.floor(Math.random() * colors.length - 1)]
        }`,
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
  console.log(req.cookies.token);
  res.clearCookie("token", {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  return res.status(200).send({
    status: 200,
    content: "Logged out successfully",
  });
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
        about: req.user?.about,
        profilePicture: req.user?.profilePicture,
        bannerPicture: req.user?.bannerPicture,
        createdAt: req.user?.createdAt,
      },
    },
  });
}

const colors = [
  "FF6B6B", // Coral Red
  "4ECDC4", // Aqua Mint
  "FFD93D", // Bright Yellow
  "6A4C93", // Deep Purple
  "FF8C42", // Tangerine
  "00A8C6", // Teal Blue
  "D7263D", // Crimson Red
  "F0A6CA", // Soft Pink
  "1B263B", // Dark Indigo
  "FF5733", // Vivid Orange
  "1FAB89", // Turquoise Green
  "FFE156", // Lemon Yellow
  "FF3F34", // Fire Red
  "A8DADC", // Light Cyan
  "E07A5F", // Terra Cotta
  "F94144", // Bold Red
  "7209B7", // Electric Purple
  "4361EE", // Bright Blue
  "4CC9F0", // Sky Blue
  "F8961E", // Vibrant Orange
];
