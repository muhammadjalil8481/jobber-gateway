import { Response } from "express";

interface SetCookieParams<T> {
  res: Response;
  name: string;
  data: T;
  maxAge: number;
}

export function setCookie<T>({ res, name, data, maxAge }: SetCookieParams<T>) {
  res.cookie(name, data, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: maxAge,
    signed: true,
  });
}
