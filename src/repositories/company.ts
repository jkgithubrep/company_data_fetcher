import { getRepository } from "typeorm";
import axios from "axios";
import cheerio from "cheerio";
import { Company } from "../models";
import { NotFoundError, ValidationError } from "../errors";

export interface ICompanyParams {
  name: string;
  siren?: string;
  address?: string;
}

const buildUrlFromParams = (params: ICompanyParams): string => {
  let baseUrl = "https://www.google.com/search?q=";
  return (baseUrl += Object.values(params)
    .map((value) => value.trim().replace(/\s+/, "+"))
    .join("+"));
};

const getResponseData = async (params: ICompanyParams): Promise<string> => {
  const queryUrl = buildUrlFromParams(params);
  console.log(queryUrl);
  const response = await axios.get(queryUrl, {
    responseType: "arraybuffer",
  });
  const ctype = response.headers["content-type"];
  console.log(ctype);
  let responseData: string;
  if (ctype.includes("charset=ISO-8859-1")) {
    responseData = response.data.toString("latin1");
  } else {
    responseData = response.data.toString();
  }
  return responseData;
};

const fetchPhoneNumber = async (
  params: ICompanyParams
): Promise<string | null> => {
  const responseData = await getResponseData(params);
  const $ = cheerio.load(responseData);
  let phoneNumber = null;
  $("span").each((i, e) => {
    if ($(e).find("span").text().includes("téléphone")) {
      phoneNumber = $(e).next().text().toString();
    }
  });
  return phoneNumber;
};

const validateName = (name: string): void => {
  if (!name) throw new ValidationError("Provide a company name.");
};

const validateAddress = (address: string | undefined): void => {
  if (!address) return;
};

const validateSiren = (siren: string | undefined): void => {
  if (!siren) return;
  const genericMessage = "Invalid siren.";
  if (siren.length !== 9) throw new ValidationError(genericMessage);
  if (/^\d+$/.test(siren)) throw new ValidationError(genericMessage);
};

const validateParams = ({ name, address, siren }: ICompanyParams): void => {
  validateName(name);
  validateAddress(address);
  validateSiren(siren);
};

const saveCompanyDataInDB = async (
  params: ICompanyParams,
  phoneNumber: string
): Promise<Company> => {
  const companyRepository = getRepository(Company);
  const company = new Company();
  const data = {
    name: params.name,
    phone_number: phoneNumber,
  };
  return companyRepository.save({
    ...company,
    ...data,
  });
};

export const fetchCompanyPhoneNumber = async (
  params: ICompanyParams
): Promise<string> => {
  validateParams(params);
  const phoneNumber = await fetchPhoneNumber(params);
  if (!phoneNumber) throw new NotFoundError("Phone number not found.");
  if (params.siren) await saveCompanyDataInDB(params, phoneNumber);
  return phoneNumber;
};
