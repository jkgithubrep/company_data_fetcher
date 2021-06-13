import { Route, Get, Tags } from "tsoa";
import {
  fetchCompanyPhoneNumber,
  ICompanyParams,
} from "../repositories/company";

@Route("api/company")
@Tags("Company")
export class CompanyController {
  @Get("/")
  public async fetchCompanyPhoneNumber(
    params: ICompanyParams
  ): Promise<string> {
    return fetchCompanyPhoneNumber(params);
  }
}
