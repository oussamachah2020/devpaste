#!/usr/bin/env node

import { program } from "commander";
import axios, { AxiosError } from "axios";
import chalk from "chalk";
import ora from "ora";
import clipboardy from "clipboardy";
import { readFileSync, existsSync, writeFileSync } from "fs";
import { resolve, extname } from "path";

const API_URL = process.env.DEVPASTE_API_URL || "http://localhost:4000";
const FRONT_URL = process.env.DEVPASTE_FRONT_URL || "http://localhost:5173";

// Language detection based on file extension
const detectLanguage = (filename: string): string => {
  const ext = extname(filename).toLowerCase();
  const languageMap: Record<string, string> = {
    ".js": "javascript",
    ".jsx": "javascript",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".py": "python",
    ".java": "java",
    ".go": "go",
    ".rs": "rust",
    ".json": "json",
    ".sql": "sql",
    ".sh": "bash",
    ".md": "markdown",
    ".html": "html",
    ".css": "css",
    ".cpp": "cpp",
    ".c": "c",
    ".rb": "ruby",
    ".php": "php",
  };

  return languageMap[ext] || "plaintext";
};

// Create paste
async function createPaste(
  content: string,
  options: {
    language?: string;
    title?: string;
    expire?: string;
    private?: boolean;
    password?: string;
    burnAfterRead?: boolean;
  }
) {
  const spinner = ora("Creating paste...").start();

  try {
    console.log(chalk.dim(`API URL: ${API_URL}/pastes`)); // Debug

    const response = await axios.post(`${API_URL}/pastes`, {
      content,
      language: options.language || "plaintext",
      title: options.title,
      expiresIn: options.expire || "1day",
      isPrivate: options.private || false,
      password: options.password,
      burnAfterRead: options.burnAfterRead || false,
    });

    spinner.succeed(chalk.green("Paste created successfully! 🎉"));

    const pasteId = response.data.id;
    const pasteUrl = `${API_URL.replace("/api", "")}/paste/${pasteId}`;

    console.log(chalk.bold("\n📋 Paste URL:"), chalk.cyan(pasteUrl));

    // Copy to clipboard
    try {
      await clipboardy.write(pasteUrl);
      console.log(chalk.dim("✓ Copied to clipboard"));
    } catch (err) {
      console.log(chalk.dim("⚠ Could not copy to clipboard"));
    }

    if (options.password) {
      console.log(chalk.yellow("🔒 Password protected"));
    }
    if (options.burnAfterRead) {
      console.log(chalk.red("🔥 Burn after read enabled"));
    }
    if (options.private) {
      console.log(chalk.magenta("🔐 Private paste"));
    }

    return pasteUrl;
  } catch (error) {
    spinner.fail(chalk.red("Failed to create paste"));

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // Network error
      if (axiosError.code === "ECONNREFUSED") {
        console.error(chalk.red("\n❌ Cannot connect to DevPaste API"));
        console.error(chalk.dim(`   Tried: ${API_URL}`));
        console.error(chalk.dim("   Is the backend running?"));
        console.error(
          chalk.dim(
            "   Run: DEVPASTE_API_URL=http://your-api-url devpaste file.js"
          )
        );
      }
      // Server error
      else if (axiosError.response) {
        console.error(
          chalk.red(`\n❌ Server error: ${axiosError.response.status}`)
        );
        console.error(
          chalk.dim(`   ${JSON.stringify(axiosError.response.data, null, 2)}`)
        );
      }
      // Request error
      else if (axiosError.request) {
        console.error(chalk.red("\n❌ No response from server"));
        console.error(chalk.dim(`   API URL: ${API_URL}`));
      }
      // Other error
      else {
        console.error(chalk.red(`\n❌ ${axiosError.message}`));
      }
    } else {
      console.error(chalk.red(`\n❌ ${error}`));
    }

    process.exit(1);
  }
}

// Get paste
async function getPaste(
  pasteId: string,
  options: {
    password?: string;
    output?: string;
  }
) {
  const spinner = ora("Fetching paste...").start();

  try {
    const response = await axios.get(`${API_URL}/pastes/${pasteId}`, {
      headers: options.password ? { "X-Paste-Password": options.password } : {},
    });

    spinner.succeed(chalk.green("Paste retrieved successfully!"));

    const paste = response.data;

    console.log(chalk.bold("\n📋 Paste Details:"));
    if (paste.title) {
      console.log(chalk.cyan(`Title: ${paste.title}`));
    }
    console.log(chalk.cyan(`Language: ${paste.language}`));
    console.log(
      chalk.cyan(`Created: ${new Date(paste.createdAt).toLocaleString()}`)
    );
    if (paste.expiresAt) {
      console.log(
        chalk.cyan(`Expires: ${new Date(paste.expiresAt).toLocaleString()}`)
      );
    }
    if (paste.burnAfterRead) {
      console.log(chalk.red("🔥 This paste will be deleted after reading!"));
    }

    console.log(chalk.bold("\n📄 Content:"));
    console.log(chalk.dim("─".repeat(50)));
    console.log(paste.content);
    console.log(chalk.dim("─".repeat(50)));

    // Save to file if output option is provided
    if (options.output) {
      writeFileSync(options.output, paste.content, "utf-8");
      console.log(chalk.green(`\n✓ Saved to ${options.output}`));
    }

    // Copy to clipboard
    try {
      await clipboardy.write(paste.content);
      console.log(chalk.dim("\n✓ Content copied to clipboard"));
    } catch (err) {
      console.log(chalk.dim("\n⚠ Could not copy to clipboard"));
    }

    return paste;
  } catch (error) {
    spinner.fail(chalk.red("Failed to fetch paste"));

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.code === "ECONNREFUSED") {
        console.error(chalk.red("\n❌ Cannot connect to DevPaste API"));
        console.error(chalk.dim(`   Tried: ${API_URL}`));
      } else if (axiosError.response) {
        if (axiosError.response.status === 401) {
          console.error(chalk.red("\n❌ Password required or incorrect"));
          console.error(chalk.dim("   Use: devpaste get <id> -P <password>"));
        } else if (axiosError.response.status === 404) {
          console.error(chalk.red("\n❌ Paste not found"));
          console.error(
            chalk.dim("   The paste may have expired or been deleted")
          );
        } else {
          console.error(
            chalk.red(`\n❌ Server error: ${axiosError.response.status}`)
          );
          console.error(
            chalk.dim(`   ${JSON.stringify(axiosError.response.data, null, 2)}`)
          );
        }
      } else if (axiosError.request) {
        console.error(chalk.red("\n❌ No response from server"));
      } else {
        console.error(chalk.red(`\n❌ ${axiosError.message}`));
      }
    } else {
      console.error(chalk.red(`\n❌ ${error}`));
    }

    process.exit(1);
  }
}

// Main program
program
  .name("devpaste")
  .description("CLI tool for DevPaste - share code instantly")
  .version("1.0.0");

// Upload file (default command)
program
  .argument("[file]", "File to upload (or read from stdin)")
  .option("-l, --language <lang>", "Programming language")
  .option("-t, --title <title>", "Paste title")
  .option(
    "-e, --expire <time>",
    "Expiration time (1hour, 1day, 1week, never)",
    "1day"
  )
  .option("-p, --private", "Make paste private")
  .option("-P, --password <password>", "Password protect the paste")
  .option("-b, --burn-after-read", "Burn after reading")
  .action(async (file, options) => {
    let content: string = "";
    let detectedLanguage: string = "plaintext";

    // Read from file
    if (file) {
      const filePath = resolve(process.cwd(), file);

      if (!existsSync(filePath)) {
        console.error(chalk.red(`❌ File not found: ${filePath}`));
        process.exit(1);
      }

      try {
        content = readFileSync(filePath, "utf-8");
        detectedLanguage = detectLanguage(filePath);
        console.log(chalk.dim(`Detected language: ${detectedLanguage}`));
      } catch (error) {
        console.error(chalk.red(`❌ Failed to read file: ${error}`));
        process.exit(1);
      }
    }
    // Read from stdin
    else {
      const chunks: Buffer[] = [];

      process.stdin.on("data", (chunk) => {
        chunks.push(chunk);
      });

      await new Promise<void>((resolve) => {
        process.stdin.on("end", () => {
          content = Buffer.concat(chunks).toString("utf-8");
          resolve();
        });
      });

      if (!content || content.trim().length === 0) {
        console.error(chalk.red("❌ No content provided"));
        console.log(chalk.dim("Usage: devpaste file.js"));
        console.log(chalk.dim("   or: cat file.js | devpaste"));
        process.exit(1);
      }
    }

    await createPaste(content, {
      language: options.language || detectedLanguage,
      title: options.title,
      expire: options.expire,
      private: options.private,
      password: options.password,
      burnAfterRead: options.burnAfterRead,
    });
  });

// Get paste command
program
  .command("get")
  .description("Retrieve a paste by ID")
  .argument("<id>", "Paste ID to retrieve")
  .option("-P, --password <password>", "Password for protected paste")
  .option("-o, --output <file>", "Save paste content to file")
  .action(async (id, options) => {
    await getPaste(id, {
      password: options.password,
      output: options.output,
    });
  });

program.parse();
