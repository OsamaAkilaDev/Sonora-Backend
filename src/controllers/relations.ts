import { Request, Response } from "express";
import { prisma } from "..";
import { AuthenticatedRequest } from "../types";
import { getRelationships } from "../utilities/queries";
import { emitRelationsTo } from "../sockets/relation";

export async function getFriendRequests(
  req: AuthenticatedRequest,
  res: Response
) {
  const userId = req.user?.id;

  if (!userId)
    return res
      .status(401)
      .send({ status: 401, content: "User not authenticated" });

  try {
    const friendships = await getRelationships(userId, "PENDING");

    const requested = friendships.filter((f) => f.requesterId === userId);
    const received = friendships.filter((f) => f.receiverId === userId);

    return res.status(200).send({
      status: 200,
      content: {
        requestedFriendships: requested,
        receivedFriendships: received,
      },
    });

    //
  } catch (err) {
    return res.status(500).send({ status: 500, content: "Operation failed" });
  }
}

export async function sendFriendRequest(
  req: AuthenticatedRequest,
  res: Response
) {
  const requesterId = req.user?.id;
  const receiverId = req.body.targetUser.id;

  if (!requesterId || !receiverId)
    return res.status(409).send({ status: 409, content: "Invalid username" });

  if (requesterId === receiverId)
    return res
      .status(409)
      .send({ status: 409, content: "You can't friend yourself" });

  const existingRelation = await prisma.relationship.findFirst({
    where: {
      requesterId: requesterId,
      receiverId: receiverId,
    },
  });

  if (existingRelation)
    if (existingRelation.status === "REJECTED") {
      await prisma.relationship.update({
        where: {
          requesterId_receiverId: {
            requesterId,
            receiverId,
          },
        },
        data: {
          status: "PENDING",
        },
      });
      emitRelationsTo(receiverId);
      emitRelationsTo(requesterId);
      return res.status(200).send({ status: 200, content: "Request Sent" });
    } else {
      return res
        .status(409)
        .send({ status: 409, content: "Request already sent" });
    }

  const opposingRelation = await prisma.relationship.findFirst({
    where: {
      requesterId: receiverId,
      receiverId: requesterId,
    },
  });

  if (opposingRelation) {
    await prisma.relationship.update({
      where: {
        id: opposingRelation.id,
      },
      data: { status: "ACCEPTED" },
    });

    emitRelationsTo(receiverId);
    emitRelationsTo(requesterId);

    return res
      .status(200)
      .send({ status: 200, content: "Friend request accepted" });
  }

  try {
    const relation = await prisma.relationship.create({
      data: {
        requesterId: requesterId,
        receiverId: receiverId,
        status: "PENDING",
      },
    });

    emitRelationsTo(receiverId);
    emitRelationsTo(requesterId);

    return res.status(200).send({ status: 200, content: "Request Sent" });
  } catch (err) {
    return res.status(500).send({ status: 500, content: "Operation Failed" });
  }
}

export async function acceptFriendRequest(
  req: AuthenticatedRequest,
  res: Response
) {
  const relationId = req.body.relationId;

  try {
    const relation = await prisma.relationship.findUnique({
      where: { id: relationId },
    });

    // Check if relation exist
    if (!relation)
      return res
        .status(404)
        .send({ status: 404, content: "Friend request not found" });

    // Check if the accepter is the receiver
    if (relation.receiverId !== req.user?.id)
      return res.status(403).send({
        status: 403,
        content: "You cannot accept a request you didn’t receive",
      });

    //  Check if the request is PENDING
    if (relation.status !== "PENDING")
      return res.status(409).send({
        status: 409,
        content: "This request is no longer pending",
      });

    await prisma.relationship.update({
      where: { id: relationId },
      data: { status: "ACCEPTED" },
    });

    emitRelationsTo(relation.receiverId);
    emitRelationsTo(relation.requesterId);

    return res
      .status(200)
      .send({ status: 200, content: "Friend request accepted" });
    //
  } catch (err) {
    return res.status(500).send({
      status: 500,
      content: "Operation Failed",
    });
  }
}

export async function rejectFriendRequest(
  req: AuthenticatedRequest,
  res: Response
) {
  const relationId = req.body.relationId;

  try {
    const relation = await prisma.relationship.findUnique({
      where: { id: relationId },
    });

    // Check if relation exist
    if (!relation)
      return res
        .status(404)
        .send({ status: 404, content: "Friend request not found" });

    // Check if the accepter is the receiver
    if (relation.receiverId !== req.user?.id)
      return res.status(403).send({
        status: 403,
        content: "You cannot take action when the request was not sent to you",
      });

    //  Check if the request is PENDING
    if (relation.status !== "PENDING")
      return res.status(409).send({
        status: 409,
        content: "This request is no longer pending",
      });

    await prisma.relationship.update({
      where: { id: relationId },
      data: { status: "REJECTED" },
    });

    emitRelationsTo(relation.receiverId);
    emitRelationsTo(relation.requesterId);

    return res
      .status(200)
      .send({ status: 200, content: "Friend request rejected" });
    //
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: 500,
      content: "Operation Failed",
    });
  }
}

export async function cancelFriendRequest(
  req: AuthenticatedRequest,
  res: Response
) {
  const relationId = req.body.relationId;

  try {
    const relation = await prisma.relationship.findUnique({
      where: { id: relationId },
    });

    // Check if relation exist
    if (!relation)
      return res
        .status(404)
        .send({ status: 404, content: "Friend request not found" });

    // Check if the requester is the one canceling the request
    if (relation.requesterId !== req.user?.id)
      return res.status(403).send({
        status: 403,
        content: "You cannot cancel a request you didn't send",
      });

    //  Check if the request is PENDING
    if (relation.status !== "PENDING")
      return res.status(409).send({
        status: 409,
        content: "This request is no longer pending",
      });

    await prisma.relationship.delete({
      where: { id: relationId },
    });

    emitRelationsTo(relation.receiverId);
    emitRelationsTo(relation.requesterId);

    return res
      .status(200)
      .send({ status: 200, content: "Friend request canceled" });
    //
  } catch (err) {
    return res.status(500).send({
      status: 500,
      content: "Operation Failed",
    });
  }
}

export async function getFriends(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id;

  if (!userId)
    return res
      .status(401)
      .send({ status: 401, content: "User not authenticated" });

  try {
    const friendships = await prisma.relationship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: userId }, { receiverId: userId }],
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

    const requested = friendships
      .filter((f) => f.requesterId === userId)
      .map((rel) => rel.receiver);

    const received = friendships
      .filter((f) => f.receiverId === userId)
      .map((rel) => rel.requester);

    // console.log(requested, received);

    return res.status(200).send({
      status: 200,
      content: [...requested, ...received],
    });

    //
  } catch (err) {
    return res.status(500).send({ status: 500, content: "Operation failed" });
  }
}
