import { getRepository } from "typeorm";
import axios from "axios";
import cheerio from "cheerio";
import { Company } from "../models";
import { NotFoundError, ValidationError } from "../errors";

export interface ICompanyPayload {
  name: string;
  siren?: string;
  address?: string;
}

const buildUrlFromPayload = (payload: ICompanyPayload): string => {
  let baseUrl = "https://www.google.com/search?q=";
  return (baseUrl += Object.values(payload)
    .map((value) => value.trim().replace(/\s+/, "+"))
    .join("+"));
};

const getResponseData = async (payload: ICompanyPayload): Promise<string> => {
  const queryUrl = buildUrlFromPayload(payload);
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
  payload: ICompanyPayload
): Promise<string | null> => {
  const responseData = await getResponseData(payload);
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

const validatePayload = ({ name, address, siren }: ICompanyPayload): void => {
  validateName(name);
  validateAddress(address);
  validateSiren(siren);
};

const saveCompanyDataInDB = async (
  payload: ICompanyPayload,
  phoneNumber: string
): Promise<Company> => {
  const companyRepository = getRepository(Company);
  const company = new Company();
  const data = {
    name: payload.name,
    phone_number: phoneNumber,
  };
  return companyRepository.save({
    ...company,
    ...data,
  });
};

export const fetchCompanyPhoneNumber = async (
  payload: ICompanyPayload
): Promise<string> => {
  validatePayload(payload);
  const phoneNumber = await fetchPhoneNumber(payload);
  if (!phoneNumber) throw new NotFoundError("Phone number not found.");
  if (payload.siren) await saveCompanyDataInDB(payload, phoneNumber);
  return phoneNumber;
};
