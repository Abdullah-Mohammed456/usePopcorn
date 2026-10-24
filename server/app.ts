import cors from "cors";
import express, { type ErrorRequestHandler, type Response } from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { z } from "zod";
import { fetchFromOmdb, OmdbProviderError } from "./omdb.js";

const app = express();
const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

if (process.env.NODE_ENV !== "production") {
  allowedOrigins.add("http://localhost:5173");
}

const movieSearchSchema = z.object({
  query: z.string().trim().min(3).max(100),
  page: z.coerce.number().int().min(1).max(100).default(1),
});
const imdbIdSchema = z.string().regex(/^tt\d{7,10}$/i);
const seasonSchema = z.coerce.number().int().min(1).max(99);

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.has(origin));
    },
    optionsSuccessStatus: 204,
  }),
);
app.use(express.json({ limit: "8kb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

app.use("/api", apiLimiter);

app.get("/api/movies", async (request, response) => {
  const parsed = movieSearchSchema.safeParse({
    query: request.query.query,
    page: request.query.page,
  });
  if (!parsed.success) {
    return response
      .status(400)
      .json({ message: "A valid search query is required." });
  }

  try {
    const result = await fetchFromOmdb({
      s: parsed.data.query,
      page: String(parsed.data.page),
    });
    return response.status(200).json(result);
  } catch (error) {
    return sendProviderError(response, error);
  }
});

app.get("/api/movies/:imdbID", async (request, response) => {
  const parsedId = imdbIdSchema.safeParse(request.params.imdbID);
  if (!parsedId.success) {
    return response
      .status(400)
      .json({ message: "A valid movie ID is required." });
  }

  try {
    const result = await fetchFromOmdb({ i: parsedId.data });
    return response.status(200).json(result);
  } catch (error) {
    return sendProviderError(response, error);
  }
});

app.get("/api/series/:imdbID/seasons/:season", async (request, response) => {
  const parsedId = imdbIdSchema.safeParse(request.params.imdbID);
  const parsedSeason = seasonSchema.safeParse(request.params.season);
  if (!parsedId.success || !parsedSeason.success) {
    return response
      .status(400)
      .json({ message: "A valid series season is required." });
  }

  try {
    const result = await fetchFromOmdb({
      i: parsedId.data,
      Season: String(parsedSeason.data),
    });
    return response.status(200).json(result);
  } catch (error) {
    return sendProviderError(response, error);
  }
});

app.use((_request, response) => {
  response.status(404).json({ message: "Not found." });
});

const handleUnexpectedError: ErrorRequestHandler = (
  _error,
  _request,
  response,
  next,
) => {
  if (response.headersSent) {
    next(_error);
    return;
  }
  response
    .status(500)
    .json({ message: "An unexpected server error occurred." });
};

app.use(handleUnexpectedError);

function sendProviderError(response: Response, error: unknown): Response {
  const code =
    error instanceof OmdbProviderError ? error.code : "OMDB_UNEXPECTED_ERROR";
  // Log only controlled fields; provider bodies and request URLs may contain keys.
  console.error("[omdb] request failed", {
    code,
    upstreamStatus:
      error instanceof OmdbProviderError ? error.upstreamStatus : undefined,
  });

  if (code === "OMDB_NOT_CONFIGURED") {
    return response.status(503).json({
      code,
      message: "The movie service is not configured yet.",
    });
  }
  if (code === "OMDB_AUTHENTICATION_FAILED") {
    return response.status(502).json({
      code,
      message:
        "The movie service is not configured correctly. Please try again later.",
    });
  }
  if (code === "OMDB_QUOTA_EXCEEDED") {
    return response.status(503).json({
      code,
      message:
        "The movie service has reached its request limit. Please try again later.",
    });
  }
  if (code === "OMDB_TIMEOUT") {
    return response.status(504).json({
      code,
      message: "OMDb took too long to respond. Please try again.",
    });
  }
  return response.status(502).json({
    code,
    message: "The movie provider is temporarily unavailable.",
  });
}

export { app };
