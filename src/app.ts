import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import router from "./routes";

const app = express();

app.set("port", process.env.PORT || 3000);

app.use(express.static("public"));

app.use(router);

export default app;
