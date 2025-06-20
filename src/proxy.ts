import {
  createProxyMiddleware,
  responseInterceptor,
} from "http-proxy-middleware";
import { log } from "./logger";
import { Request, Response } from "express";
import { generateGatewayToken } from "./middlewares/gateway-token";
import { checkServiceName } from "./helpers/checkServiceName";
import { NotFoundError } from "@muhammadjalil8481/jobber-shared";
import { setCookie } from "./helpers/setCookie";

interface createProxyParams {
  target: string;
  serviceName: string;
  serviceNameForLogging: string;
  handleSelfResponse?: boolean;
}

function responseLogger(
  req: Request,
  statusCode: number,
  serviceNameForLogging: string
) {
  const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const message = `Proxy Service Response: ${serviceNameForLogging}, Url : ${url}, Method: ${req.method}, StatusCode : ${statusCode}`;
  if (statusCode! >= 400) log.error(message);
  else log.info(message);
}

export const createProxy = ({
  target,
  serviceName,
  serviceNameForLogging,
  handleSelfResponse = false,
}: createProxyParams) => {
  return createProxyMiddleware({
    target, // The target URL of the service to proxy requests to
    changeOrigin: true, // Change the origin of the host header to the target (service) URL
    pathRewrite: (_path: string, req: Request) => {
      if (!checkServiceName(serviceName))
        throw new NotFoundError("Url Not Found", "Proxy Request Function");

      const url = new URL(
        `${req.protocol}://${req.get("host")}${req.originalUrl}`
      );
      const pattern = new RegExp(`^/api/(v[0-9]+)/${serviceName}(\\/.*)?$`);
      const match = url.pathname.match(pattern);
      if (!match)
        throw new NotFoundError("Url Not Found", "Proxy Request Function");

      let rewrittenPath = `/api/${match[1]}${match[2] || ""}`;
      const queryString = url.search; // includes ? and the params

      return rewrittenPath + queryString;
    },

    selfHandleResponse: handleSelfResponse,
    on: {
      proxyReq: (proxyReq, req: Request) => {
        const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
        const gatewayToken = generateGatewayToken();
        proxyReq.setHeader("x-gateway-token", gatewayToken);
        const accessToken = req.signedCookies?.accessToken;
        if (accessToken && req.currentUser) {
          proxyReq.setHeader("Authorization", `Bearer ${accessToken}`);
          proxyReq.setHeader("x-user", JSON.stringify(req.currentUser));
        }
        const refreshToken = req.signedCookies?.refreshToken;
        if (refreshToken) {
          proxyReq.setHeader("x-refresh-token", refreshToken);
        }
        log.info(
          `Proxy Service Request: ${serviceNameForLogging}, Url : ${url}, Method : ${req.method}`
        );
      },
      proxyRes: handleSelfResponse
        ? responseInterceptor(
            async (responseBuffer, proxyRes, req, res: Response) => {
              responseLogger(
                req,
                proxyRes.statusCode || 500,
                serviceNameForLogging
              );
              try {
                const body = responseBuffer.toString("utf-8");
                const data = JSON.parse(body);

                if (data.accessToken) {
                  setCookie({
                    res,
                    name: "accessToken",
                    data: data.accessToken,
                    maxAge: 15 * 60 * 1000,
                  });
                  delete data.accessToken;
                }

                if (data.refreshToken) {
                  setCookie({
                    res,
                    name: "refreshToken",
                    data: data.refreshToken,
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                  });
                  delete data.refreshToken;
                }

                return JSON.stringify(data); // return modified body
              } catch (error) {
                log.error(
                  `Failed to parse proxy response for ${serviceNameForLogging}`,
                  error
                );
                res.status(500).json({
                  status: "error",
                  message: "Internal Server Error",
                });
                return ""; // must return something
              }
            }
          )
        : (proxyRes, req, _res: Response) => {
            responseLogger(
              req,
              proxyRes.statusCode || 500,
              serviceNameForLogging
            );
          },
      error: (err, _req, res) => {
        log.error(`Proxy Error: ${serviceNameForLogging}, ${err.message}`);

        (res as any).writeHead(502, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Bad Gateway",
            message: err.message,
          })
        );
      },
    },
  });
};

export const notificationProxy = createProxy({
  target: "http://localhost:4001",
  serviceName: "notifications",
  serviceNameForLogging: "Notifications",
  handleSelfResponse: false,
});

export const authProxy = createProxy({
  target: "http://localhost:4002",
  serviceName: "auth",
  serviceNameForLogging: "Authentication",
  handleSelfResponse: true,
});
