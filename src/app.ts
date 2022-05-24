/**
 * Required External Modules
 */
import express from "express";
import router from "router";
import { AppConfig } from "config/app.config";
import cron from "cron/cron";

// Activate cron schedule
cron;

const app = express();
/**
 *  App Configuration
 */

app.use(express.json());
app.use(router);

const PORT = AppConfig.port;

/**
 * Server Activation
 */
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

export default app;
