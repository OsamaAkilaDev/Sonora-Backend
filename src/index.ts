import express, { Request, Response } from "express";
import { authRoutes } from "./routes/auth";
import { PrismaClient } from "./generated/prisma";
import { PORT } from "./secrets";
import { allowedOrigins, corsOptions } from "./utilities/corsConfig";
import cors from "cors";
import cookieParser from "cookie-parser";
import { relationRoutes } from "./routes/relations";
import { Server } from "socket.io";
import { chatRoutes } from "./routes/chats";

const app = express();

// CORS config
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Assigning Middlewares
app.use(cookieParser());
app.use(express.json());

// Assigning Routes
app.use("/api/auth", authRoutes);
app.use("/api/relation", relationRoutes);
app.use("/api/chat", chatRoutes);

app.get("/api/ping", (req: Request, res: Response) => {
  return res.status(200).send({ message: "Ping!" });
});

// Start express server
const serverApp = app.listen(PORT, () =>
  console.log("Listening on PORT", PORT)
);

// Initialize prisma
export const prisma = new PrismaClient();

// Start web socket app
export const io = new Server(serverApp, {
  cors: {
    origin: allowedOrigins,
  },
});

io.on("connection", (socket) => {
  console.log(`User connected`);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User joined with id: ${userId}`);
  });
});
