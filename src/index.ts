import express from "express";
import { authRoutes } from "./routes/auth";
import { PrismaClient } from "./generated/prisma";
import { PORT } from "./secrets";
import { corsOptions } from "./utilities/corsConfig";
import cors from "cors";
import cookieParser from "cookie-parser";
import { relationRoutes } from "./routes/relations";

const app = express();

// CORS config
app.use(cors(corsOptions));

// Assigning Middlewares
app.use(cookieParser());
app.use(express.json());

// Assigning Routes
app.use("/api/auth", authRoutes);
app.use("/api/relation", relationRoutes);

export const prisma = new PrismaClient();
app.listen(PORT, () => console.log("Listening on PORT", PORT));
