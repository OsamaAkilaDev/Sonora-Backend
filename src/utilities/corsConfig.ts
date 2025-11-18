// src/config/corsConfig.ts
import { CorsOptions } from "cors";

export const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
export const corsOptions: CorsOptions = {
  origin: allowedOrigins, // or ['http://localhost:5173']
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
