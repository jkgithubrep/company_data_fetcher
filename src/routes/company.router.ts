import express, { Request, Response } from "express";
import { ValidationError } from "../errors";
import { CompanyController } from "../controllers/company.controller";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const controller = new CompanyController();
  try {
    console.log(req.query);
    const data = { phone_number: "XXXX " };
    // const data = await controller.fetchCompanyData(req.body);
    res.send(data);
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400);
      res.send(err.message);
    } else {
      res.status(500);
      res.send("Please try again later.");
    }
  }
});

export default router;
