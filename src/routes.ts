import express, { Request, Response } from "express";
import { log } from "./logger";
import { StatusCodes } from "http-status-codes";

const router = express.Router();

router.get("/health", (_: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

router.use("*", (req: Request, res: Response) => {
  const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  log.error(`Gateway service error: ${url} does not exist`);
  res.status(StatusCodes.NOT_FOUND).json({
    message: "Url Not Found",
  });
});

export default router;
