import { Route, Get, Tags } from "tsoa";
import {
  fetchCompanyPhoneNumber,
  ICompanyPayload,
} from "../repositories/company";

@Route("api/company")
@Tags("Company")
export class CompanyController {
  @Get("/")
  public async fetchCompanyPhoneNumber(
    payload: ICompanyPayload
  ): Promise<string> {
    return fetchCompanyPhoneNumber(payload);
  }
}
