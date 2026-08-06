import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const args = process.argv.slice(2);
const CONFIG_DIR = path.join(os.homedir(), ".smartleads");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
  }
  return { server: "http://localhost:3000", api_key: "" };
}

function saveConfig(config: any) {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

async function main() {
  const command = args[0];
  const subCommand = args[1];

  if (!command) {
    console.log("Usage: smartleads <command> [options]");
    console.log("\nCommands:");
    console.log("  auth login --key <api-key>");
    console.log("  auth status");
    console.log("  leads list");
    console.log("  chat <query>");
    return;
  }

  const config = loadConfig();

  if (command === "auth" && subCommand === "login") {
    const keyIndex = args.indexOf("--key");
    if (keyIndex > -1 && args[keyIndex + 1]) {
      config.api_key = args[keyIndex + 1];
      saveConfig(config);
      console.log("✅ Authenticated successfully");
    } else {
      console.log("Error: Please provide an API key using --key");
    }
    return;
  }

  if (command === "auth" && subCommand === "status") {
    if (config.api_key) {
      console.log(`✅ Logged in (Key: ${config.api_key.substring(0, 12)}...)`);
    } else {
      console.log("❌ Not logged in");
    }
    return;
  }

  if (!config.api_key) {
    console.log("❌ Error: Not authenticated. Use 'smartleads auth login --key <api-key>'");
    return;
  }

  const api = axios.create({
    baseURL: config.server + "/api",
    headers: { Authorization: `Bearer ${config.api_key}` },
  });

  try {
    if (command === "leads" && subCommand === "list") {
      const res = await api.get("/leads");
      console.log(`\n📋 Found ${res.data.length} leads:`);
      console.log("---------------------------------------------------------");
      res.data.slice(0, 10).forEach((l: any) => {
        console.log(`- ${l.name.padEnd(20)} | Score: ${l.score} | Priority: ${l.priority}`);
      });
      if (res.data.length > 10) console.log("... and more");
      console.log("---------------------------------------------------------");
    } else if (command === "chat") {
      const query = args.slice(1).join(" ");
      if (!query) {
        console.log("Please provide a query.");
        return;
      }
      const res = await api.post("/chat", { query });
      console.log(`\n🤖 AI Response:\n\n${res.data.message}\n`);
    } else {
      console.log(`Unknown command: ${command} ${subCommand || ""}`);
    }
  } catch (error: any) {
    console.error("❌ API Error:", error.response?.data?.error || error.message);
  }
}

main();
