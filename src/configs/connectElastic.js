import { Client } from "@opensearch-project/opensearch";

const elasticClient = new Client({
  // node: "https://127.0.0.1:9200",
  // auth: {
  //   username: 'elastic',
  //   password: '7WhWVDMBDWWeC8oQ6tRJ'
  //   },
  // tls: {
  //   rejectUnauthorized: false,
  // },
  node: process.env.ELESTICSTICSEARCH_HOST,
  auth: {
    username: process.env.ELESTICSTICSEARCH_USERNAME,
    password: process.env.ELESTICSTICSEARCH_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function connectElastic() {
  try {
    const health = await elasticClient.cluster.health();
    console.log("Connected to Elasticsearch:", health.body?.status);
  } catch (error) {
    console.error("Error connecting to Elasticsearch:", error);
  }
}

export { elasticClient, connectElastic };
// docker run -d --name elasticsearch -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" elasticsearch:8.17.3
//docker exec -it elasticsearch bin/elasticsearch-reset-password -u elastic
//docker exec -it elasticsearch bin/elasticsearch-plugin list
//docker exec -it elasticsearch bin/elasticsearch-plugin install analysis-icu
