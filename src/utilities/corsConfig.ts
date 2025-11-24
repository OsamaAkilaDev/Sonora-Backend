import { CorsOptions } from "cors";

export const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    console.log("Incoming Origin:", origin);

    // Allow requests with no origin (Postman, curl)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, ""); // remove trailing slash

    const isAllowed = allowedOrigins.some(
      (o) => o.replace(/\/$/, "") === normalizedOrigin
    );

    if (isAllowed) callback(null, true);
    else callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
