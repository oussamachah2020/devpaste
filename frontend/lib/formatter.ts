import prettier from "prettier/standalone";
import prettierPluginBabel from "prettier/plugins/babel";
import prettierPluginEstree from "prettier/plugins/estree";
import prettierPluginTypescript from "prettier/plugins/typescript";
import prettierPluginHtml from "prettier/plugins/html";
import prettierPluginPostcss from "prettier/plugins/postcss";
import prettierPluginMarkdown from "prettier/plugins/markdown";

export const formatCode = async (
  code: any,
  language: string
): Promise<string> => {
  if (code === null || code === undefined) {
    throw new Error("Code is empty");
  }

  const codeString = String(code).trim();

  if (!codeString) {
    throw new Error("Code is empty");
  }

  const normalizedLang = language.toLowerCase();

  try {
    let parser: string;
    let plugins: any[];

    switch (normalizedLang) {
      case "javascript":
      case "jsx":
        parser = "babel";
        plugins = [prettierPluginBabel, prettierPluginEstree]; // ✅ Include estree!
        break;
      case "typescript":
      case "tsx":
        parser = "typescript";
        plugins = [prettierPluginTypescript, prettierPluginEstree]; // ✅ Include estree!
        break;
      case "json":
        parser = "json";
        plugins = [prettierPluginBabel, prettierPluginEstree];
        break;
      case "html":
        parser = "html";
        plugins = [prettierPluginHtml];
        break;
      case "css":
      case "scss":
        parser = "css";
        plugins = [prettierPluginPostcss];
        break;
      case "markdown":
        parser = "markdown";
        plugins = [prettierPluginMarkdown];
        break;
      default:
        throw new Error(`Formatting not supported for ${language}`);
    }

    const formatted = await prettier.format(codeString, {
      parser,
      plugins,
      printWidth: 80,
      tabWidth: 2,
      semi: true,
      singleQuote: true,
      trailingComma: "es5",
      bracketSpacing: true,
      arrowParens: "avoid",
    });

    return formatted;
  } catch (error: any) {
    console.error("Prettier formatting error:", error);

    if (
      error.message?.includes("Unexpected token") ||
      error.message?.includes("SyntaxError")
    ) {
      throw new Error("Code has syntax errors. Fix them before formatting.");
    }

    throw new Error(`Failed to format: ${error.message || "Unknown error"}`);
  }
};

export const isFormattable = (language: string): boolean => {
  const formattableLanguages = [
    "javascript",
    "typescript",
    "jsx",
    "tsx",
    "json",
    "html",
    "css",
    "scss",
    "markdown",
  ];

  return formattableLanguages.includes(language.toLowerCase());
};
