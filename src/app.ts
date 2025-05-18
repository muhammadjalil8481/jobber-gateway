import express from "express";
import { startServer } from "./server";
import { initializeGlobalMiddleware } from "./middlewares/global.middleware";
import router from "./routes";
import { notificationProxy } from "./proxy";
import { errorHandlerMiddleware } from "@muhammadjalil8481/jobber-shared";
import { log } from "./logger";

const app = express();

initializeGlobalMiddleware(app);

app.use("/notifications", notificationProxy);

app.use(router);

startServer(app);

app.use(errorHandlerMiddleware({ log, serviceName: "Gatway Service" }));

export default app;
