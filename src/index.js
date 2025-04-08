import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import routers from "./routes/index.js";
import connectDB from "./configs/connectDB.js";
import {connectElastic} from "./configs/connectElastic.js";
import upload from "./utils/fileUpload.js";
import dotenv from "dotenv";
import multer from "multer";
import cors from "cors";
import {syncSetupDoctorsToElasticsearch,syncDoctorsToElasticsearch} from "./utils/syncDoctorsToElasticsearch.js";

dotenv.config();

let app = express();

const corsOptions = {
  origin: `http://localhost:${process.env.FE_PORT}`, 
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
await syncSetupDoctorsToElasticsearch();
await syncDoctorsToElasticsearch();

let port = process.env.PORT || 9000;

app.listen(port, () => {
  console.log("Backend Nodejs is running on the port: " + port);
});
