import express from "express";
import CompanyRouter from "./company.router";

const router = express.Router();

const root = "/api";

router.use(`${root}/company`, CompanyRouter);

export default router;
