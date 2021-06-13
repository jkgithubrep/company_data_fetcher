import { getRepository } from "typeorm";
import axios from "axios";
import cheerio from "cheerio";
import stringSimilarity from "string-similarity";
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
    .map((value) => value.trim().replace(/\s+/g, "+"))
    .join("+"));
};

const getResponseData = async (params: ICompanyParams): Promise<string> => {
  const queryUrl = buildUrlFromParams(params);
  const response = await axios.get(queryUrl, {
    responseType: "arraybuffer",
  });
  const ctype = response.headers["content-type"];
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
  if (!/\d+$/.test(siren)) throw new ValidationError(genericMessage);
};

const validateParams = ({ name, address, siren }: ICompanyParams): void => {
  validateName(name);
  validateAddress(address);
  validateSiren(siren);
};

type DataGouvApiResponse = {
  unite_legale: {
    id: number;
    denomination: string;
    etablissement_siege: {
      libelle_voie: string;
      code_commune: string;
    };
  };
};

type CompanyData = {
  name: string;
  siren: string;
  postalCode: string;
  address: string;
};

const verifySirenProvided = async (
  name: string,
  siren: string
): Promise<CompanyData> => {
  const dataGouvApi =
    "https://entreprise.data.gouv.fr/api/sirene/v3/unites_legales";
  const response = await axios.get<DataGouvApiResponse>(
    `${dataGouvApi}/${siren}`
  );

  if (!response.data.unite_legale) throw new ValidationError("Siren unknown.");

  const data = response.data.unite_legale;

  const nameFromDataGouv = data.denomination;
  const addressFromDataGouv = data.etablissement_siege.libelle_voie;
  const postalCodeFromDataGouv = data.etablissement_siege.code_commune;

  if (!nameFromDataGouv || !addressFromDataGouv || !postalCodeFromDataGouv)
    throw new Error("Missing data to save entry in database.");

  const companyNameSimilarityScore = stringSimilarity.compareTwoStrings(
    nameFromDataGouv.toLowerCase(),
    name.toLowerCase()
  );
  if (companyNameSimilarityScore < 0.6)
    throw new ValidationError("Name provided does not match siren.");

  return {
    name: nameFromDataGouv,
    siren: siren,
    address: addressFromDataGouv,
    postalCode: postalCodeFromDataGouv,
  };
};

const saveCompanyDataInDB = async (
  name: string,
  siren: string,
  phoneNumber: string
): Promise<void> => {
  let dataToSave: CompanyData;
  try {
    dataToSave = await verifySirenProvided(name, siren);
  } catch (err) {
    console.log(err);
    return;
  }
  const companyRepository = getRepository(Company);
  const company = new Company();
  const data = {
    name: dataToSave.name,
    siren: dataToSave.siren,
    address: dataToSave.address,
    postal_code: dataToSave.postalCode,
    phone_number: phoneNumber,
  };
  await companyRepository.save({
    ...company,
    ...data,
  });
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  const digits = [...phoneNumber.trim().split(/\s+/).join("")];
  if (digits.length !== 10) return phoneNumber;
  const mask = "+33 # ## ## ## ##";
  return digits
    .slice(1)
    .reduce((acc, curr) => (acc = acc.replace("#", curr)), mask);
};

export const findCompanyInDB = async (
  params: ICompanyParams
): Promise<Company | null> => {
  const result = await getRepository(Company).findOne({
    where: { siren: params.siren },
  });
  if (result) return result;
  return null;
};

export const fetchCompanyPhoneNumber = async (
  params: ICompanyParams
): Promise<string> => {
  validateParams(params);
  if (params.siren) {
    const companyFound = await findCompanyInDB(params);
    if (companyFound) {
      return companyFound.phone_number;
    }
  }
  const phoneNumber = await fetchPhoneNumber(params);
  if (!phoneNumber) throw new NotFoundError("Phone number not found.");
  if (params.siren)
    await saveCompanyDataInDB(params.name, params.siren, phoneNumber);
  return phoneNumber;
};
