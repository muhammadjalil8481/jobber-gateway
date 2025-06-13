import { createProxyMiddleware } from "http-proxy-middleware";
import { log } from "./logger";
import { Request, Response } from "express";
import { generateGatewayToken } from "./middlewares/gateway-token";

interface createProxyParams {
  target: string;
  pathRewrite: string;
  serviceNameForLogging: string;
  handleSelfResponse?: boolean;
}

export const createProxy = ({
  target,
  pathRewrite,
  serviceNameForLogging,
  handleSelfResponse = false,
}: createProxyParams) => {
  return createProxyMiddleware({
    target, // The target URL of the service to proxy requests to
    changeOrigin: true, // Change the origin of the host header to the target (service) URL
    pathRewrite: {
      [pathRewrite]: "", // remove the specified path from the request URL
    },
    selfHandleResponse: handleSelfResponse,
    on: {
      proxyReq: (proxyReq, req: Request) => {
        const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
        const gatewayToken = generateGatewayToken();
        const bearerToken = req?.session?.jwt;
        proxyReq.setHeader("x-gateway-token", gatewayToken);
        if (bearerToken) {
          proxyReq.setHeader("Authorization", `Bearer ${bearerToken}`);
        }
        log.info(
          `Proxy Service Request: ${serviceNameForLogging}, Url : ${url}, Method : ${req.method}`
        );
      },
      proxyRes: (proxyRes, req, res: Response) => {
        const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
        const statusCode = proxyRes.statusCode;
        const message = `Proxy Service Response: ${serviceNameForLogging}, Url : ${url}, Method: ${req.method}, StatusCode : ${statusCode}`;
        if (statusCode! >= 400) log.error(message);
        else log.info(message);

        if (handleSelfResponse) {
          let body = "";
          proxyRes.on("data", (chunk: Buffer) => {
            body += chunk.toString("utf8");
          });
          proxyRes.on("end", () => {
            try {
              const data = JSON.parse(body);
              if (data.token) {
                // Set the cookie on the response to client
                req.session!.jwt = data.token;
                delete data.token;
              }
              res.status(statusCode!).json(data);
            } catch (error) {
              log.error(
                `Failed to parse proxy response for ${serviceNameForLogging}`,
                error
              );
              res.status(500).json({
                status: "error",
                message: "Internal Server Error",
              });
            }
          });
        }
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
  pathRewrite: "^/notifications",
  serviceNameForLogging: "Notifications",
  handleSelfResponse: false,
});

export const authProxy = createProxy({
  target: "http://localhost:4002",
  pathRewrite: "^/auth",
  serviceNameForLogging: "Authentication",
  handleSelfResponse: true,
});
