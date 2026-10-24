import cors from "cors";
import express, { type ErrorRequestHandler, type Response } from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { z } from "zod";

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
  const parsed = movieSearchSchema.safeParse({ query: request.query.query });
  if (!parsed.success) {
    return response.status(400).json({ message: "A valid search query is required." });
  }

  try {
    const result = await fetchFromOmdb({ s: parsed.data.query });
    return response.status(200).json(result);
  } catch {
    return sendProviderError(response);
  }
});

app.get("/api/movies/:imdbID", async (request, response) => {
  const parsedId = imdbIdSchema.safeParse(request.params.imdbID);
  if (!parsedId.success) {
    return response.status(400).json({ message: "A valid movie ID is required." });
  }

  try {
    const result = await fetchFromOmdb({ i: parsedId.data });
    return response.status(200).json(result);
  } catch {
    return sendProviderError(response);
  }
});

app.get("/api/series/:imdbID/seasons/:season", async (request, response) => {
  const parsedId = imdbIdSchema.safeParse(request.params.imdbID);
  const parsedSeason = seasonSchema.safeParse(request.params.season);
  if (!parsedId.success || !parsedSeason.success) {
    return response.status(400).json({ message: "A valid series season is required." });
  }

  try {
    const result = await fetchFromOmdb({
      i: parsedId.data,
      Season: String(parsedSeason.data),
    });
    return response.status(200).json(result);
  } catch {
    return sendProviderError(response);
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
  response.status(500).json({ message: "An unexpected server error occurred." });
};

app.use(handleUnexpectedError);

async function fetchFromOmdb(params: Record<string, string>): Promise<unknown> {
  const apiKey = process.env.OMDB_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OMDB_API_KEY is not configured.");
  }

  const url = new URL("https://www.omdbapi.com/");
  for (const [key, value] of Object.entries({ ...params, apikey: apiKey })) {
    url.searchParams.set(key, value);
  }

  const upstream = await fetch(url, { signal: AbortSignal.timeout(8_000) });
  if (!upstream.ok) {
    throw new Error("Movie provider request failed.");
  }
  return (await upstream.json()) as unknown;
}

function sendProviderError(response: Response): Response {
  if (!process.env.OMDB_API_KEY?.trim()) {
    return response.status(503).json({
      message: "The movie service is not configured yet.",
    });
  }
  return response.status(502).json({
    message: "The movie provider is temporarily unavailable.",
  });
}

export { app };
