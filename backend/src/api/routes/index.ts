import { Router } from "express";
import { Request, Response } from "express";

const router = Router();

router.use("/api", (_req: Request, res: Response) => {
  res.send("Hello, world!");
});


export default router;
