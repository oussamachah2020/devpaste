import fs from "fs";
import { api } from "../utils/api";
import { copyToClipboard } from "../utils/clipboard";
import { detectLanguage } from "../utils/language";
import { getConfig } from "../utils/config";
import ora from "ora";
import chalk from "chalk";

interface UploadOptions {
  title?: string;
  language?: string;
  expire?: "1hour" | "1day" | "1week" | "never";
  private?: boolean;
  burn?: boolean;
  password?: string;
  copy?: boolean;
}

export async function uploadCommand(
  fileOrContent: string,
  options: UploadOptions
): Promise<void> {
  const spinner = ora("Uploading paste...").start();

  try {
    // Read content
    let content: string;
    let detectedLang: string;
    let title: string | undefined = options.title;

    if (fs.existsSync(fileOrContent)) {
      // It's a file
      content = fs.readFileSync(fileOrContent, "utf-8");
      detectedLang = options.language || detectLanguage(fileOrContent);
      if (!title) {
        title = fileOrContent.split("/").pop();
      }
      spinner.text = `Uploading ${chalk.cyan(fileOrContent)}...`;
    } else {
      // It's direct content
      content = fileOrContent;
      detectedLang = options.language || "plaintext";
    }

    // Create paste
    const paste = await api.createPaste({
      content,
      title,
      language: detectedLang,
      expiresIn: options.expire || "1week",
      isPrivate: options.private || false,
      burnAfterRead: options.burn || false,
      password: options.password,
    });

    const config = getConfig();
    const url = `${config.webUrl}/paste/${paste.id}`;

    spinner.succeed(chalk.green("Paste created successfully!"));

    // Display info
    console.log();
    console.log(chalk.bold("📋 Paste Details:"));
    console.log(chalk.gray("─".repeat(50)));
    if (paste.title) {
      console.log(`${chalk.bold("Title:")} ${paste.title}`);
    }
    console.log(`${chalk.bold("Language:")} ${chalk.cyan(paste.language)}`);
    console.log(`${chalk.bold("ID:")} ${paste.id}`);
    if (paste.expiresAt) {
      const expiresDate = new Date(paste.expiresAt);
      console.log(`${chalk.bold("Expires:")} ${expiresDate.toLocaleString()}`);
    }
    if (paste.isPrivate) {
      console.log(chalk.yellow("🔒 Private (unlisted)"));
    }
    if (paste.burnAfterRead) {
      console.log(chalk.red("🔥 Burn after read"));
    }
    if (paste.hasPassword) {
      console.log(chalk.blue("🔐 Password protected"));
    }
    console.log(chalk.gray("─".repeat(50)));
    console.log();
    console.log(chalk.bold.green("🔗 URL:"), chalk.underline.blue(url));
    console.log();

    // Copy to clipboard
    if (options.copy !== false) {
      const copied = await copyToClipboard(url);
      if (copied) {
        console.log(chalk.green("✓ URL copied to clipboard!"));
      }
    }
  } catch (error: any) {
    spinner.fail(chalk.red("Failed to create paste"));
    console.error(chalk.red("Error:"), error.message);
    process.exit(1);
  }
}
