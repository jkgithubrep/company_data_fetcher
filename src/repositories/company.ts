import { getRepository } from "typeorm";
import { Company } from "../models";

export interface ICompanyPayload {
  name: string;
  siren?: string;
  address?: string;
}

export const fetchCompanyData = async ({
  name,
  siren,
  address,
}: ICompanyPayload): Promise<Company> => {
  const companyRepository = getRepository(Company);
  const company = new Company();
  const data = {
    name: name,
    phone_number: "00000000",
  };
  return companyRepository.save({
    ...company,
    ...data,
  });
};
