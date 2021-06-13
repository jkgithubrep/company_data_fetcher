import app from "./app";
import { createConnection } from "typeorm";
import { configDB } from "./db/config";

(async () => {
  try {
    await createConnection(configDB);
    app.listen(app.get("port"), () => {
      console.log(
        "App is running at http://localhost:%d in %s mode",
        app.get("port"),
        app.get("env")
      );
      console.log("Press CTRL-C to stop\n");
    });
  } catch (err) {
    console.log("Unable to connect to db", err);
    process.exit(1);
  }
})();
