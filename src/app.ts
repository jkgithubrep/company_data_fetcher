import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import swaggerUi from "swagger-ui-express";
import router from "./routes";

const app = express();

app.set("port", process.env.PORT || 3000);

app.use(express.static("public"));

app.use(router);

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/swagger.json",
    },
  })
);

export default app;
