import { getConfig, setConfig } from "../utils/config";
import chalk from "chalk";

export function configGetCommand(): void {
  const config = getConfig();
  console.log(chalk.bold("Current Configuration:"));
  console.log(chalk.gray("─".repeat(50)));
  console.log(`${chalk.bold("API URL:")} ${config.apiUrl}`);
  console.log(`${chalk.bold("Web URL:")} ${config.webUrl}`);
}

export function configSetCommand(key: string, value: string): void {
  const validKeys = ["apiUrl", "webUrl"];

  if (!validKeys.includes(key)) {
    console.error(
      chalk.red(`Invalid config key. Valid keys: ${validKeys.join(", ")}`)
    );
    process.exit(1);
  }

  setConfig({ [key]: value });
  console.log(chalk.green(`✓ Updated ${key} to ${value}`));
}
