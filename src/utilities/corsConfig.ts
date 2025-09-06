// src/config/corsConfig.ts
import { CorsOptions } from "cors";

export const allowedOrigins = [
  "http://localhost:5173", // Dev frontend,
  "http://localhost:4173", // Dev frontend,
  "http://192.168.0.197:5173",
  "https://myapp.com", // Production frontend
];

export const corsOptions: CorsOptions = {
  origin: allowedOrigins, // or ['http://localhost:5173']
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
