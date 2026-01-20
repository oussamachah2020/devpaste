import { api } from "../utils/api";
import ora from "ora";
import chalk from "chalk";

interface GetOptions {
  password?: string;
  raw?: boolean;
}

export async function getCommand(
  pasteId: string,
  options: GetOptions
): Promise<void> {
  const spinner = ora("Fetching paste...").start();

  try {
    const paste = await api.getPaste(pasteId, options.password);
    spinner.succeed(chalk.green("Paste retrieved!"));

    if (options.raw) {
      // Output raw content only
      console.log(paste.content);
    } else {
      // Display formatted info
      console.log();
      console.log(chalk.bold("📋 Paste Details:"));
      console.log(chalk.gray("─".repeat(50)));
      if (paste.title) {
        console.log(`${chalk.bold("Title:")} ${paste.title}`);
      }
      console.log(`${chalk.bold("Language:")} ${chalk.cyan(paste.language)}`);
      console.log(`${chalk.bold("Views:")} ${paste.views}`);
      console.log(
        `${chalk.bold("Created:")} ${new Date(
          paste.createdAt
        ).toLocaleString()}`
      );
      if (paste.expiresAt) {
        console.log(
          `${chalk.bold("Expires:")} ${new Date(
            paste.expiresAt
          ).toLocaleString()}`
        );
      }
      console.log(chalk.gray("─".repeat(50)));
      console.log();
      console.log(chalk.bold("Content:"));
      console.log(paste.content);
    }
  } catch (error: any) {
    spinner.fail(chalk.red("Failed to fetch paste"));

    if (error.response?.status === 401) {
      console.error(
        chalk.red("This paste is password protected. Use --password option.")
      );
    } else {
      console.error(chalk.red("Error:"), error.message);
    }

    process.exit(1);
  }
}
