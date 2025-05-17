import { ConfigType, validateEnvVariables } from "@muhammadjalil8481/jobber-shared";
import dotenv from "dotenv";

dotenv.config();
class Config {
  public NODE_ENV: string | undefined;
  public PORT: string | undefined;
  public GATEWAY_JWT_TOKEN: string | undefined;
  public JWT_TOKEN: string | undefined;
  public SECRET_KEY_ONE: string | undefined;
  public SECRET_KEY_TWO: string | undefined;
  public CLIENT_URL: string | undefined;
  // public AUTH_BASE_URL: string | undefined;
  // public USERS_BASE_URL: string | undefined;
  // public GIG_BASE_URL: string | undefined;
  // public MESSAGE_BASE_URL: string | undefined;
  // public ORDER_BASE_URL: string | undefined;
  // public REVIEW_BASE_URL: string | undefined;
  // public REDIS_HOST: string | undefined;
  public ELASTIC_SEARCH_URL: string | undefined;
  public ELASTIC_APM_SERVER_URL: string | undefined;
  // public ELASTIC_APM_SECRET_TOKEN: string | undefined;
  // public ENABLE_APM: string | undefined;

  constructor() {
    this.NODE_ENV = process.env.NODE_ENV || "";
    this.PORT = process.env.PORT || "";
    this.GATEWAY_JWT_TOKEN = process.env.GATEWAY_JWT_TOKEN || "";
    this.JWT_TOKEN = process.env.JWT_TOKEN || "";
    this.SECRET_KEY_ONE = process.env.SECRET_KEY_ONE || "";
    this.SECRET_KEY_TWO = process.env.SECRET_KEY_TWO || "";
    this.CLIENT_URL = process.env.CLIENT_URL || "";
    this.ELASTIC_SEARCH_URL = process.env.ELASTIC_SEARCH_URL || "";
    this.ELASTIC_APM_SERVER_URL = process.env.ELASTIC_APM_SERVER_URL || "";
    
    validateEnvVariables(this as unknown as ConfigType);
  }
}


export const config = new Config();
