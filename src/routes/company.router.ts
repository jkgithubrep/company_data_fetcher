import express, { Request, Response } from "express";
import { NotFoundError, ValidationError } from "../errors";
import { CompanyController } from "../controllers/company.controller";
import { ICompanyPayload } from "../repositories/company";

const router = express.Router();

type CompanyRequest = Request<unknown, unknown, unknown, ICompanyPayload>;

router.get("/", async (req: CompanyRequest, res: Response) => {
  const controller = new CompanyController();
  try {
    const phoneNumber = await controller.fetchCompanyPhoneNumber(req.query);
    res.send(phoneNumber);
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(200);
      res.send(err.message);
    } else if (err instanceof ValidationError) {
      res.status(400);
      res.send(err.message);
    } else {
      console.log(err);
      res.status(500);
      res.send("Please try again later.");
    }
  }
});

export default router;
