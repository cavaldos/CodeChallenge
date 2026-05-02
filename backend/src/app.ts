import dotenv from "dotenv";
dotenv.config();

import express, { json } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import routers from "./api/routes";
import { Request, Response } from "express";

// Normalize origin: add protocol if missing
const normalizeOrigin = (origin: string): string => {
  const trimmed = origin.trim();
  if (!trimmed.startsWith('http')) {
    return `http://${trimmed}`;
  }
  return trimmed;
};

// Check if origin matches allowed pattern (supports wildcard for ports)
// Examples: "192.168.1.9:*" matches any port, "192.168.1.9:5173" matches exact port
const isOriginAllowed = (origin: string, allowedOrigins: string[]): boolean => {
  for (const allowed of allowedOrigins) {
    // Exact match
    if (origin === allowed) return true;

    // Wildcard port matching: "ip:*" matches any port on that IP
    if (allowed.endsWith(':*')) {
      const ipPrefix = allowed.slice(0, -2); // Remove ":*"
      if (origin.startsWith(ipPrefix)) return true;
    }
  }
  return false;
};

const DEFAULT_ORIGINS = ["http://localhost:5173"];

const parseOrigins = (env: string | undefined): string[] => {
  if (!env) return DEFAULT_ORIGINS;

  let trimmed = env.trim();
  if (!trimmed) return DEFAULT_ORIGINS;

  // Remove surrounding quotes
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1);
  }

  // Handle array format: [value1,value2] or ['value1','value2']
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const inner = trimmed.slice(1, -1).replace(/['"]/g, '').trim();
    if (!inner) return DEFAULT_ORIGINS;
    return inner.split(',').map(normalizeOrigin).filter(Boolean);
  }

  return trimmed.split(',').map(normalizeOrigin).filter(Boolean);
};

const ALLOWED_ORIGINS = parseOrigins(process.env.CORS_ORIGINS);

console.log('[CORS] Allowed origins:', ALLOWED_ORIGINS);

const corsOrigin = (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
) => {
  // Allow requests with no origin (e.g., mobile apps, curl)
  if (!origin) {
    callback(null, true);
    return;
  }

  const normalizedOrigin = normalizeOrigin(origin);
  const allowed = isOriginAllowed(normalizedOrigin, ALLOWED_ORIGINS);

  console.log('[CORS] Request:', normalizedOrigin, '| Allowed:', allowed);
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
