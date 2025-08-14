import { Request } from "express";
import { User } from "../generated/prisma";

interface AuthenticatedRequest extends Request {
  user?: User;
}
