import hljs from "highlight.js/lib/core";

// Import only the languages we support
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import json from "highlight.js/lib/languages/json";
import sql from "highlight.js/lib/languages/sql";
import bash from "highlight.js/lib/languages/bash";
import markdown from "highlight.js/lib/languages/markdown";

// Register languages
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("java", java);
hljs.registerLanguage("go", go);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("json", json);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("markdown", markdown);

export const detectLanguage = (code: string): string => {
  if (!code || code.trim().length < 10) {
    return "plaintext";
  }

  try {
    // Use highlight.js auto-detection
    const result = hljs.highlightAuto(code, [
      "javascript",
      "typescript",
      "python",
      "java",
      "go",
      "rust",
      "json",
      "sql",
      "bash",
      "markdown",
    ]);

    // If confidence is too low, use pattern matching
    if (result.relevance < 5) {
      return detectByPatterns(code);
    }

    return result.language || "plaintext";
  } catch {
    return detectByPatterns(code);
  }
};

// Fallback pattern-based detection
const detectByPatterns = (code: string): string => {
  const trimmed = code.trim();

  // JSON detection
  if (
    (trimmed.startsWith("{") || trimmed.startsWith("[")) &&
    (trimmed.endsWith("}") || trimmed.endsWith("]"))
  ) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {
      // Not valid JSON
    }
  }

  // Python - check for common patterns
  if (/^(def|class|import|from|if __name__|print\()/m.test(code)) {
    return "python";
  }

  // TypeScript - check for type annotations
  if (
    /:\s*(string|number|boolean|any|void|interface|type)\s*[=;{]/.test(code) ||
    /^(interface|type|enum)\s+\w+/.test(code)
  ) {
    return "typescript";
  }

  // JavaScript - check for common patterns
  if (
    /(const|let|var|function|=>|console\.log|require\(|import\s+.*from)/.test(
      code
    )
  ) {
    return "javascript";
  }

  // Java - check for class declarations
  if (
    /(public|private|protected)\s+(class|interface|enum)/.test(code) ||
    /System\.out\.println/.test(code)
  ) {
    return "java";
  }

  // Go - check for package and func
  if (/^package\s+\w+/m.test(code) || /func\s+\w+\s*\(/.test(code)) {
    return "go";
  }

  // Rust - check for fn and use
  if (/fn\s+\w+|use\s+std::/.test(code) || /impl\s+\w+/.test(code)) {
    return "rust";
  }

  // SQL - check for common keywords
  if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s+/im.test(code)) {
    return "sql";
  }

  // Bash - check for shebang or common commands
  if (
    /^#!\/bin\/(ba)?sh/m.test(code) ||
    /(echo|cd|ls|mkdir|rm|grep|awk|sed)\s+/.test(code)
  ) {
    return "bash";
  }

  // Markdown - check for markdown syntax
  if (
    /^#{1,6}\s+/.test(code) ||
    /\[.*\]\(.*\)/.test(code) ||
    /```/.test(code)
  ) {
    return "markdown";
  }

  return "plaintext";
};
