import { Router } from "express";
import { authenticateToken } from "../middlewares/auth";
import {
  createChat,
  deleteMessage,
  editMessage,
  getChatData,
  getChatList,
  sendMessage,
} from "../controllers/chats";

export const chatRoutes: Router = Router();

// CREATE CHAT
chatRoutes.post("/", authenticateToken, createChat);

// READ CHAT
chatRoutes.get("/list", authenticateToken, getChatList);
chatRoutes.get("/:id", authenticateToken, getChatData);

// CREATE MESSAGE
chatRoutes.post("/message", authenticateToken, sendMessage);

// UPDATE MESSAGE
chatRoutes.put("/message/edit", authenticateToken, editMessage);

// DELETE
chatRoutes.delete("/message/delete", authenticateToken, deleteMessage);
