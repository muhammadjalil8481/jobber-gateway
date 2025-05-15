import { createProxyMiddleware } from "http-proxy-middleware";
import { log } from "./logger";
import { Request } from "express";
import { generateGatewayToken } from "./middlewares/gateway-token";

interface createProxyParams {
  target: string;
  pathRewrite: string;
  serviceNameForLogging: string;
}

export const createProxy = ({
  target,
  pathRewrite,
  serviceNameForLogging,
}: createProxyParams) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      [pathRewrite]: "",
    },
    on: {
      proxyReq: (proxyReq, req: Request) => {
        const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
        const gatewayToken = generateGatewayToken();
        proxyReq.setHeader("x-gateway-token", gatewayToken);
        log.info(
          `Proxy Service Request: ${serviceNameForLogging}, Url : ${url}, Method : ${req.method}`
        );
      },
      proxyRes: (proxyRes, req, _res) => {
        const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
        const statusCode = proxyRes.statusCode;
        const message = `Proxy Service Response: ${serviceNameForLogging}, Url : ${url}, Method: ${req.method}, StatusCode : ${statusCode}`;
        if (statusCode! >= 400) log.error(message);
        else log.info(message);
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
});
