import { Client } from "@elastic/elasticsearch";

const elasticClient = new Client({
  node: "https://127.0.0.1:9200",
  auth: {
    username: 'elastic',
    password: 'nsy3Ehy3b0UQ+hCwPnZX'
    },
  tls: {
    rejectUnauthorized: false,
  },
});

async function connectElastic() {
  try {
    const health = await elasticClient.cluster.health();
    console.log("Connected to Elasticsearch:", health.status);
  } catch (error) {
    console.error("Error connecting to Elasticsearch:", error);
  }
}

export  {elasticClient, connectElastic};
// docker run -d --name elasticsearch -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" elasticsearch:8.17.3
//docker exec -it elasticsearch bin/elasticsearch-reset-password -u elastic
//docker exec -it elasticsearch bin/elasticsearch-plugin list
//docker exec -it elasticsearch bin/elasticsearch-plugin install analysis-icu