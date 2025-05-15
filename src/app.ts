import express from "express";
import { startServer } from "./server";
import { initializeGlobalMiddleware } from "./middlewares/global.middleware";
import { errorHandlerMiddleware } from "./middlewares/error-handler.middleware";
import router from "./routes";
import { notificationProxy } from "./proxy";

const app = express();

initializeGlobalMiddleware(app);

app.use("/notifications", notificationProxy);

app.use(router);

startServer(app);

errorHandlerMiddleware(app);

export default app;
