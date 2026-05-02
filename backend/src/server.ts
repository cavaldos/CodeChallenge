import color from "ansi-colors";
import app from "./app";
import "./config/setup";
import getIPAddresses from "./config/IP";
import { fetchPublicIP } from "./config/IP";
import portfinder from "portfinder";
import dotenv from "dotenv";
import { testDatabaseConnection } from "./database/connection";

dotenv.config();
const IP = getIPAddresses.IP();

const PORSERVER: number = process.env.PORT_SERVER
  ? parseInt(process.env.PORT_SERVER)
  : 5003;


const host: string = "0.0.0.0";
async function startServer() {
  try {
    const publicIP = await fetchPublicIP();
    const PORT = await portfinder.getPortPromise({ port: PORSERVER });

    // Start server first, then test DB connection
    app.listen(PORT, host, () => {
      console.log(
        `  🚀  ➜ Network:  `,
        color.blue(`http://${publicIP}:${PORT}`),
      );
      console.log(`  🚀  ➜   Local:  `, color.green(`http://${IP}:${PORT}`));
      console.log("  ⏳  ➜  Checking database connection...");

      // Test DB after server is listening
      testDatabaseConnection().then((dbConnected) => {
        if (!dbConnected) {
          console.warn(
            "  ⚠️  Database unavailable. Server is running in degraded mode. Check DB_* environment variables.",
          );
        }
      });
    });
  } catch (error: unknown) {
    console.error("❌ Server startup error:", error);
  }
}

startServer();
