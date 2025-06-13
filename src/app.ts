import express from "express";
import { startServer } from "./server";
import { initializeGlobalMiddleware } from "./middlewares/global.middleware";
import router from "./routes";
import { authProxy, notificationProxy } from "./proxy";
import { errorHandlerMiddleware } from "@muhammadjalil8481/jobber-shared";
import { log } from "./logger";

const app = express();

initializeGlobalMiddleware(app);

app.use("/notifications", notificationProxy);
app.use("/auth", authProxy); // Assuming authProxy is similar to notificationProxy

// Use these 2 middlewares after the proxy middlewares
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

app.use(router);

startServer(app);

app.use(errorHandlerMiddleware({ log, serviceName: "Gatway Service" }));

export default app;
