import {
  formatPhoneNumber,
  fetchCompanyPhoneNumber,
  ICompanyParams,
} from "../repositories/company";

export class CompanyController {
  public async fetchCompanyPhoneNumber(
    params: ICompanyParams
  ): Promise<string> {
    return formatPhoneNumber(await fetchCompanyPhoneNumber(params));
  }
}
