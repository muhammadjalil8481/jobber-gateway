import { config } from "@gateway/config";
import {
  IAuthPayload,
  NotAuthorizedError,
} from "@muhammadjalil8481/jobber-shared";
import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

const verifyUser = (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (!req.session?.jwt) {
      throw new NotAuthorizedError(
        "Unauthorized.",
        "Gateway Service verifyUser() method"
      );
    }
    const payload: IAuthPayload = verify(
      req.session?.jwt,
      config.JWT_TOKEN!
    ) as IAuthPayload;
    req.currentUser = payload;
  } catch (error) {
    throw new NotAuthorizedError(
      "Unauthorized.",
      "Gateway Service verifyUser() method"
    );
  }
  next();
};

const checkAuthentication = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.currentUser)
    throw new NotAuthorizedError(
      "Unauthorized.",
      "Gateway Service checkAuthentication() method"
    );
  next();
};

export { verifyUser, checkAuthentication };
