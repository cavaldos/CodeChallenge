import express, { json } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import routers from "./api/routes";
import { Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec, swaggerUiOptions } from "./config/swagger";

const app = express();


app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: '*',
    exposedHeaders: ['Content-Length', 'X-Requested-With', 'Authorization'],
  }),
);
app.use(json());
app.use(helmet());
app.use(morgan('tiny'));

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
app.get("/api-docs.json", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use(routers);


app.get("/", (_req: Request, res: Response) => {
  //create button to Guide directly to Swagger docs
  res.send("<h1>Hello , Welcome to my server</h1><p><a href='/api-docs'>View API Docs</a></p>");

});
export default app;
