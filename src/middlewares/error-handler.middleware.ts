import { Application, NextFunction, Request, Response } from "express";
import { CustomError, IErrorResponse } from "@muhammadjalil8481/jobber-shared";
import { log } from "../logger";

function errorHandlerMiddleware(app: Application) {
  app.use(
    (error: IErrorResponse, _: Request, res: Response, next: NextFunction) => {
      try {
        log.error(`Gateway service error ${error.comingFrom}`, error);
        if (error instanceof CustomError) {
          res.status(error.statusCode).json(error.serializeErrors());
        } else {
          res.status(error.statusCode || 500).json({
            message: error.message || "Internal Server Error",
          });
        }
      } catch (err) {
        log.error("Gateway Service Unexpected Error in error handler middleware", err);
        next();
      }
    }
  );
}

export { errorHandlerMiddleware };
