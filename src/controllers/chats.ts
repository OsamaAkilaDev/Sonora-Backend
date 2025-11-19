import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import { prisma } from "..";
import { getChatListFor } from "../utilities/queries";
import { emitChatListTo, emitChatMessageTo } from "../sockets/chat";

export async function createChat(req: AuthenticatedRequest, res: Response) {
  const uid: any = req.user?.id;
  const uid2: any = req.body.targetUser.id;

  // Check if user is requesting chat with itself
  if (uid === uid2)
    return res
      .status(409)
      .send({ status: 409, content: "You can't create a chat with yourself" });

  // Check for existing chat
  const existingChat = await prisma.chat.findFirst({
    where: {
      isGroup: false,
      participants: {
        some: { userId: uid },
      },
      AND: {
        participants: {
          some: { userId: uid2 },
        },
      },
    },
  });

  if (existingChat)
    return res.status(200).send({ status: 200, content: existingChat });

  // Create new chat
  const newChat = await prisma.chat.create({
    data: { participants: { create: [{ userId: uid }, { userId: uid2 }] } },
  });

  emitChatListTo(uid);
  emitChatListTo(uid2);

  return res.status(200).send({ status: 200, content: newChat });
}

export async function getChatList(req: AuthenticatedRequest, res: Response) {
  const uid: any = req.user?.id;
  const chats = await getChatListFor(uid);
  return res.status(200).send({ status: 200, content: chats });
}

export async function getChatData(req: AuthenticatedRequest, res: Response) {
  const uid: any = req.user?.id;
  const chatId: any = req.params.id;

  const chatData = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      participants: {
        where: { userId: { not: uid } },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              username: true,
              profilePicture: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              displayName: true,
              profilePicture: true,
            },
          },
        },
      },
    },
  });

  if (!chatData)
    return res.status(404).send({
      status: 404,
      content: "No chat with this ID exist",
    });

  return res.status(200).send({ status: 200, content: chatData });
}

export async function sendMessage(req: AuthenticatedRequest, res: Response) {
  const uid: any = req.user?.id;
  const chatId: any = req.body.chatId;
  const message: any = req.body.messageContent;

  try {
    const newMessage = await prisma.message.create({
      data: { content: message, chatId: chatId, senderId: uid },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePicture: true,
          },
        },
      },
    });

    const chatData = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: { select: { userId: true } },
      },
    });

    if (!chatData)
      return res.status(404).send({
        status: 404,
        content: "No chat with this ID exist",
      });

    chatData?.participants.forEach((participant) => {
      emitChatMessageTo(participant.userId, chatId, newMessage);
    });

    return res
      .status(200)
      .send({ status: 200, content: "Message Sent Successfully" });
  } catch (e) {
    return res
      .status(500)
      .send({ status: 500, content: "Internal server error" });
  }
}

export async function editMessage(req: AuthenticatedRequest, res: Response) {}

export async function deleteMessage(req: AuthenticatedRequest, res: Response) {}
