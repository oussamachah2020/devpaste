import { api } from "../utils/api";
import ora from "ora";
import chalk from "chalk";
import inquirer from "inquirer";

interface DeleteOptions {
  force?: boolean;
}

export async function deleteCommand(
  pasteId: string,
  options: DeleteOptions
): Promise<void> {
  if (!options.force) {
    const answers = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `Are you sure you want to delete paste ${chalk.cyan(
          pasteId
        )}?`,
        default: false,
      },
    ]);

    if (!answers.confirm) {
      console.log(chalk.yellow("Deletion cancelled."));
      return;
    }
  }

  const spinner = ora("Deleting paste...").start();

  try {
    await api.deletePaste(pasteId);
    spinner.succeed(chalk.green("Paste deleted successfully!"));
  } catch (error: any) {
    spinner.fail(chalk.red("Failed to delete paste"));
    console.error(chalk.red("Error:"), error.message);
    process.exit(1);
  }
}
