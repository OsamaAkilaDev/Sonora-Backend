import { Router } from "express";
import { authenticateToken } from "../middlewares/auth";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  getFriendRequests,
  getFriends,
  rejectFriendRequest,
  sendFriendRequest,
} from "../controllers/relations";
import { getUser } from "../controllers/user";

export const relationRoutes: Router = Router();

relationRoutes.get("/friends", authenticateToken, getFriends);

relationRoutes.get("/friend-requests", authenticateToken, getFriendRequests);

relationRoutes.post(
  "/send-friendship-request",
  authenticateToken,
  getUser,
  sendFriendRequest
);

relationRoutes.put(
  "/accept-friendship-request",
  authenticateToken,
  acceptFriendRequest
);

relationRoutes.put(
  "/reject-friendship-request",
  authenticateToken,
  rejectFriendRequest
);

relationRoutes.delete(
  "/cancel-friendship-request",
  authenticateToken,
  cancelFriendRequest
);
