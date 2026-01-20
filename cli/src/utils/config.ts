import fs from "fs";
import path from "path";
import os from "os";

interface Config {
  apiUrl: string;
  webUrl: string;
}

const CONFIG_DIR = path.join(os.homedir(), ".devpaste");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

const DEFAULT_CONFIG: Config = {
  apiUrl: "http://localhost:4000/api",
  webUrl: "http://localhost:5173",
};

export function getConfig(): Config {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      return DEFAULT_CONFIG;
    }
    const data = fs.readFileSync(CONFIG_FILE, "utf-8");
    return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function setConfig(config: Partial<Config>): void {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    const currentConfig = getConfig();
    const newConfig = { ...currentConfig, ...config };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
  } catch (error) {
    throw new Error("Failed to save configuration");
  }
}
