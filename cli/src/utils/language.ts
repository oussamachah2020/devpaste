import path from "path";

const extensionMap: Record<string, string> = {
  ".js": "javascript",
  ".jsx": "jsx",
  ".ts": "typescript",
  ".tsx": "tsx",
  ".py": "python",
  ".java": "java",
  ".go": "go",
  ".rs": "rust",
  ".json": "json",
  ".sql": "sql",
  ".sh": "bash",
  ".bash": "bash",
  ".md": "markdown",
  ".html": "html",
  ".css": "css",
  ".scss": "scss",
  ".php": "php",
  ".rb": "ruby",
  ".swift": "swift",
  ".kt": "kotlin",
  ".cpp": "cpp",
  ".c": "c",
  ".cs": "csharp",
};

export function detectLanguage(filename?: string): string {
  if (!filename) return "plaintext";

  const ext = path.extname(filename).toLowerCase();
  return extensionMap[ext] || "plaintext";
}
