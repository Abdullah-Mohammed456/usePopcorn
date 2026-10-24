import "dotenv/config";
import { app } from "./app.js";

const portValue = process.env.PORT ?? "3000";
const port = Number(portValue);

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("PORT must be a valid TCP port");
}

app.listen(port, "0.0.0.0", () => {
  console.info(`API server listening on port ${port}.`);
});
