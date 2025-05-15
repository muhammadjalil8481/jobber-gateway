import { Application } from "express";
import { config } from "./config";
import { log } from "./logger";
import { elasticsearch } from "./elasticsearch";

const SERVER_PORT = config.PORT || 4000;

function startServer(app: Application) {
  try {
    app.listen(config.PORT, () => {
      log.info(`Gateway service running on port ${SERVER_PORT}`);
      elasticsearch.checkConnection();
    });
  } catch (error) {
    log.error(`Gateway service error startServer() Error : `, error);
  }
}

export { startServer };
