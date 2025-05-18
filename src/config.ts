import { createConfig } from "@muhammadjalil8481/jobber-shared";
import dotenv from "dotenv";

const envList = [
  "NODE_ENV",
  "PORT",
  "GATEWAY_JWT_TOKEN",
  "JWT_TOKEN",
  "SECRET_KEY_ONE",
  "SECRET_KEY_TWO",
  "CLIENT_URL",
  "ELASTIC_SEARCH_URL",
  "ELASTIC_APM_SERVER_URL",
] as const;

dotenv.config();

export const config = createConfig(envList);
