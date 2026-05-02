import dotenv from "dotenv";
dotenv.config();

import express, { json } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import routers from "./api/routes";
import { Request, Response } from "express";

const normalizeOrigin = (origin: string): string => {
  const trimmed = origin.trim();
  
  // Add protocol if missing
  if (!trimmed.startsWith('http')) {
    return `http://${trimmed}`;
  }
  
  return trimmed;
};

const DEFAULT_ALLOWED_ORIGINS = ["http://localhost:5173"];

const parseOrigins = (env: string | undefined): string[] => {
  if (!env) return DEFAULT_ALLOWED_ORIGINS;

  let trimmed = env.trim();

  if (!trimmed) return DEFAULT_ALLOWED_ORIGINS;

  // Remove surrounding quotes if present (e.g., "['http://localhost:5173']")
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1);
  }

  // Handle array format: [value1,value2] or ['value1','value2']
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const inner = trimmed.slice(1, -1).replace(/['"]/g, '').trim();

    if (!inner) return DEFAULT_ALLOWED_ORIGINS;

    return inner
      .split(',')
      .map(origin => normalizeOrigin(origin))
      .filter(Boolean);
  }

  return trimmed
    .split(',')
    .map(origin => normalizeOrigin(origin))
    .filter(Boolean);
};

const ALLOWED_ORIGINS = parseOrigins(process.env.CORS_ORIGINS);

console.log('[CORS] CORS_ORIGINS:', process.env.CORS_ORIGINS);
console.log('[CORS] ALLOWED_ORIGINS:', ALLOWED_ORIGINS);

const corsOrigin = (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
) => {
  console.log('[CORS] Request origin:', origin);

  if (!origin) {
    callback(null, true);
    return;
  }

  const normalizedOrigin = normalizeOrigin(origin);
  const allowed = ALLOWED_ORIGINS.includes(normalizedOrigin);

  console.log('[CORS] Allowed:', allowed);
  callback(null, allowed);
};

const app = express();


app.use(
  cors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Requested-With', 'Authorization'],
  }),
);
app.use(json());
app.use(helmet());
app.use(morgan('tiny'));


app.use(routers);


app.get("/", (_req: Request, res: Response) => {
  res.send("<h1>Hello , Welcome to my server</h1>");

});
export default app;
