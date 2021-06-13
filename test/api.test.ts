import request from "supertest";
import app from "../src/app";
import { Company } from "../src/models";
import { findCompanyInDB } from "../src/repositories/company";
import { createConnection, getConnection, getRepository } from "typeorm";
import { configDB } from "../src/db/config";

/**
 * Clean test database before running tests.
 */
beforeAll(async () => {
  await createConnection(configDB);
  await getRepository(Company).createQueryBuilder().delete().execute();
});

/**
 * Test GET on /api/company
 */
describe("GET /api/company", () => {
  describe("Correct params", () => {
    it("should return 200 ok (number found)", async () => {
      const result = await request(app).get("/api/company").query({
        name: "EXPERDECO",
        address: "74970 MARIGNIER",
        siren: "303830244",
      });
      expect(result.status).toEqual(200);
      expect(result.text).toBe("+33 4 50 34 63 54");
    });

    it("should return 200 ok (number found from db)", async () => {
      const params = {
        name: "EXPERDECO",
        address: "74970 MARIGNIER",
        siren: "303830244",
      };
      const result = await findCompanyInDB(params);
      expect(result?.phone_number).toBe("04 50 34 63 54");
    });

    it("should return 200 ok (number not found)", async () => {
      const result = await request(app).get("/api/company").query({
        name: "ATMOSPHERE",
        address: "07110 CHASSIERS",
        siren: "308198449",
      });
      expect(result.status).toEqual(200);
      expect(result.text).toBe("Phone number not found.");
    });
  });

  describe("Incorrect params", () => {
    it("should return 400 (missing company name)", async () => {
      const result = await request(app).get("/api/company");
      expect(result.status).toEqual(400);
      expect(result.text).toBe("Provide a company name.");
    });

    it("should return 400 (invalid siren - letter)", async () => {
      const result = await request(app).get("/api/company").query({
        name: "EXPERDECO",
        address: "74970 MARIGNIER",
        siren: "30383024a",
      });
      expect(result.status).toEqual(400);
      expect(result.text).toBe("Invalid siren.");
    });

    it("should return 400 (invalid siren - length 8 < 9)", async () => {
      const result = await request(app).get("/api/company").query({
        name: "EXPERDECO",
        address: "74970 MARIGNIER",
        siren: "30383024",
      });
      expect(result.status).toEqual(400);
      expect(result.text).toBe("Invalid siren.");
    });
  });
});

/**
 * Close connection to database when all test are run.
 */
afterAll(async () => {
  await getConnection().close();
});
