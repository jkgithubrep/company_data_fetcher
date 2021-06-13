import { ConnectionOptions } from "typeorm";
import { Company } from "../models";

const getOptions = (env: string): ConnectionOptions => {
  const connectionOptions: ConnectionOptions = {
    type: "postgres",
    entities: [Company],
    synchronize: true,
  };
  if (env === "production") {
    Object.assign(connectionOptions, {
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  } else if (env === "development") {
    Object.assign(connectionOptions, {
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
    });
  } else {
    Object.assign(connectionOptions, {
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB_TEST,
    });
  }
  return connectionOptions;
};

export const configDB = getOptions(process.env.NODE_ENV || "development");
