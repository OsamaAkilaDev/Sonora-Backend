import dotenv from "dotenv";

dotenv.config({ path: ".env" });

export const PORT = process.env.PORT!;
export const JWT_SECRET = process.env.JWT_SECRET!;
export const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(",");
export const NODE_ENV = process.env.NODE_ENV;
