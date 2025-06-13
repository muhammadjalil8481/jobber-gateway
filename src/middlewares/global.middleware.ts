import express, { Application } from "express";
import compression from "compression";
import cookieSession from "cookie-session";
import hpp from "hpp";
import helmet from "helmet";
import cors from "cors";
import { config } from "@gateway/config";

function initializeGlobalMiddleware(app: Application) {
  app.use(compression());
 
  app.set("trust proxy", true); // Trust the first proxy (e.g., if behind a load balancer)

  app.use(
    cookieSession({
      name: "session", // name of the cookie
      keys: [config.SECRET_KEY_ONE,config.SECRET_KEY_TWO], // array of keys for signing cookies (empty means no signing)
      maxAge: 24 * 60 * 60 * 1000, // the maximum age of the session cookie (24 hours)
      secure: config.NODE_ENV !== 'development', // cookie will be sent over both HTTP and HTTPS (not recommended for production)
      // sameSite: 'none' // optional property for controlling cross-site request behavior
    })
  );

  app.use(hpp()); // Prevent HTTP Parameter Pollution
  app.use(helmet()); // Set various HTTP headers for security
  app.use(
    cors({
      origin: "",
      credentials: true, // Allow credentials (cookies, authorization headers, etc.) to be sent
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
    })
  );
}

export { initializeGlobalMiddleware };
