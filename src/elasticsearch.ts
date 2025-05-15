import { Client } from "@elastic/elasticsearch";
import { log } from "./logger";
import { ClusterHealthResponse } from "@elastic/elasticsearch/lib/api/types";
import { config } from "./config";

class ElasticSearch {
  private elasticSearchClient: Client;
  constructor() {
    this.elasticSearchClient = new Client({
      node: config.ELASTIC_SEARCH_URL,
    });
  }

  public async checkConnection() {
    let isConnected = false;
    while (!isConnected) {
      log.info("Gateway service connecting to Elasticsearch...");
      try {
        const health: ClusterHealthResponse =
          await this.elasticSearchClient.cluster.health({});
        log.info(
          `Gateway service Elasticsearch connection successful: ${health.status}`
        );
        isConnected = true;
      } catch (error) {
        log.error("Gateway service Elasticsearch connection error:", error);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }
}

export const elasticsearch = new ElasticSearch();
