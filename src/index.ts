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
// import https from "https";
// import fs from "fs";

// const key = fs.readFileSync("cert.key");
// const cert = fs.readFileSync("cert.crt");

const app = express();

// CORS config
app.use(cors(corsOptions));

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

// const expressApp = https.createServer({ key, cert }, app);

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

  // Handle signaling events for WebRTC (Calls)

  // Calling
  socket.on("call-user", ({ to, offer }) => {
    io.to(to).emit("incoming-call", {
      from: socket.id,
      offer,
    });
  });

  // Answer calling
  socket.on("answer-call", ({ to, answer }) => {
    io.to(to).emit("call-answered", answer);
  });

  // Exchange ICE candidates
  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", candidate);
  });
});
