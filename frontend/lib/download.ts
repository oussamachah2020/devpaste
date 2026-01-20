export const downloadPaste = (
  content: string,
  filename: string,
  language: string
) => {
  // Get proper file extension
  const extension = getFileExtension(language);
  const fullFilename = filename || `paste-${Date.now()}`;
  const filenameWithExt = fullFilename.includes(".")
    ? fullFilename
    : `${fullFilename}${extension}`;

  // Create blob
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filenameWithExt;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const getFileExtension = (language: string): string => {
  const extensions: Record<string, string> = {
    javascript: ".js",
    typescript: ".ts",
    python: ".py",
    java: ".java",
    go: ".go",
    rust: ".rs",
    json: ".json",
    sql: ".sql",
    bash: ".sh",
    markdown: ".md",
    html: ".html",
    css: ".css",
    php: ".php",
    ruby: ".rb",
    swift: ".swift",
    kotlin: ".kt",
    cpp: ".cpp",
    c: ".c",
    csharp: ".cs",
    plaintext: ".txt",
  };

  return extensions[language.toLowerCase()] || ".txt";
};
