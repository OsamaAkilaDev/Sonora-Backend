import { prisma } from "..";
import { RelationshipStatus } from "../generated/prisma";

export async function getRelationships(id: string, status: RelationshipStatus) {
  const friendships = await prisma.relationship.findMany({
    where: {
      status: status,
      OR: [{ requesterId: id }, { receiverId: id }],
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      receiverId: true,
      requesterId: true,
      requester: {
        select: {
          id: true,
          username: true,
          displayName: true,
          profilePicture: true, // pick only the fields you want
        },
      },
      receiver: {
        select: {
          id: true,
          username: true,
          displayName: true,
          profilePicture: true,
        },
      },
    },
  });

  return friendships;
}
