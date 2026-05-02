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

const parseOrigins = (env: string | undefined): string[] => {
  if (!env) return ['http://localhost:5173']; 
  
  // Allow all origins in development
  if (env.trim() === '*') {
    return ['*'];
  }
  
  let trimmed = env.trim();
  
  // Remove surrounding quotes if present (e.g., "['192.168.1.9']" -> ['192.168.1.9'])
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || 
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    trimmed = trimmed.slice(1, -1);
  }
  
  // Handle array format: [value1,value2] or ['value1','value2']
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    // Remove inner quotes and brackets, then split
    const inner = trimmed.slice(1, -1)
      .replace(/['"]/g, '')  // Remove inner quotes
      .trim();
    if (!inner) return ['http://localhost:5173'];
    return inner.split(',').map(o => normalizeOrigin(o)).filter(Boolean);
  }
  
  // Simple comma-separated: localhost,192.168.1.9
  return trimmed.split(',').map(o => normalizeOrigin(o)).filter(Boolean);
};

const ALLOWED_ORIGINS = parseOrigins(process.env.CORS_ORIGINS);

console.log('[CORS] CORS_ORIGINS:', process.env.CORS_ORIGINS);
console.log('[CORS] ALLOWED_ORIGINS:', ALLOWED_ORIGINS);

// CORS origin validator - allows any port for matching origins
const corsOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  console.log('[CORS] Request origin:', origin);
  
  // Allow all origins
  if (ALLOWED_ORIGINS.includes('*')) {
    callback(null, true);
    return;
  }
  
  if (!origin) {
    callback(null, true);
    return;
  }
  
  const allowed = ALLOWED_ORIGINS.some(allowedOrigin => {
    // Exact match
    if (origin === allowedOrigin) return true;
    // Match any port - extract hostname from request origin and compare
    const requestUrl = new URL(origin);
    const allowedUrl = new URL(allowedOrigin);
    if (requestUrl.hostname === allowedUrl.hostname) {
      return true;
    }
    return false;
  });
  
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
