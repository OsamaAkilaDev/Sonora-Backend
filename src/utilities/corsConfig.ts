// src/config/corsConfig.ts
import { CorsOptions } from "cors";
import { ALLOWED_ORIGINS } from "../secrets";

export const allowedOrigins = ALLOWED_ORIGINS;

export const corsOptions: CorsOptions = {
  origin: allowedOrigins, // or ['http://localhost:5173']
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
