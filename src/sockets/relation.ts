import { io } from "..";
import { getRelationships } from "../utilities/queries";

export async function emitRelationsTo(id: string) {
  const friendships = await getRelationships(id, "ACCEPTED");
  const pendingFriendships = await getRelationships(id, "PENDING");

  io.to(id).emit("update-social-data", {
    friends: friendships.map((rel) =>
      rel.requesterId === id ? rel.receiver : rel.requester
    ),
    receivedRequests: pendingFriendships.filter((f) => f.receiverId === id),
    sentRequests: pendingFriendships.filter((f) => f.requesterId === id),
  });
}
