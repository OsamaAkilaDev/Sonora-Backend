import { io } from "..";
import { getChatListFor } from "../utilities/queries";

export async function emitChatListTo(id: string) {
  const chatList = await getChatListFor(id);

  io.to(id).emit("update-chat-list", {
    chatList: chatList,
  });
}

export async function emitChatMessageTo(id: string, message: any, tempId: any) {
  io.to(id).emit("new-message", { ...message, tempId });
}
