import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import routers from "./routes/index.js";
import connectDB from "./configs/connectDB.js";
import { connectElastic } from "./configs/connectElastic.js";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { initSocket } from "./integrations/socket/index.js";
import { initializeElasticsearch } from "./integrations/elasticsearch/index.js";
import initializeCronJobs from "./cronjobs/index.js";

dotenv.config();

let app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.URL_REACT,
    credentials: true,
  },
});

//Ket noi voi socket.io
initSocket(io);

const corsOptions = {
  origin: process.env.URL_REACT,
  credentials: true,
};
// config app
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

routers(app);

await connectDB();
await connectElastic();
await initializeElasticsearch(false);
await initializeCronJobs();
// await syncSetupDoctorsToElasticsearch();
// await syncDoctorsToElasticsearch();

let port = process.env.PORT || 9000;

server.listen(port, () => {
  console.log("Server Socket.io is running on port: " + port);
});
