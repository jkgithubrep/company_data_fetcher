import { Route, Get, Body, Tags } from "tsoa";
import { Company } from "../models";
import { fetchCompanyData, ICompanyPayload } from "../repositories/company";

@Route("api/company")
@Tags("User")
export class CompanyController {
  @Get("/")
  public async fetchCompanyData(
    @Body() body: ICompanyPayload
  ): Promise<Company> {
    return fetchCompanyData(body);
  }
}
