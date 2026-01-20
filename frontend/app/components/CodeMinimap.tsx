import { useEffect, useRef, useState } from "react";

interface CodeMinimapProps {
  code: string;
  currentLine?: number;
  onLineClick?: (line: number) => void;
  height?: number;
  language?: string;
}

export function CodeMinimap({
  code,
  currentLine = 0,
  onLineClick,
  height = 400,
  language = "javascript",
}: CodeMinimapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
  const lines = code.split("\n");

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onLineClick) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const y = e.clientY - rect.top;
    const lineHeight = height / Math.max(lines.length, 1);
    const clickedLine = Math.floor(y / lineHeight);

    onLineClick(Math.min(clickedLine, lines.length - 1));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const y = e.clientY - rect.top;
    const lineHeight = height / Math.max(lines.length, 1);
    const line = Math.floor(y / lineHeight);

    setHoveredLine(Math.min(line, lines.length - 1));
  };

  const handleMouseLeave = () => {
    setHoveredLine(null);
  };

  // Calculate visible viewport
  const totalLines = lines.length;
  const linesPerViewport = Math.floor(height / 21); // approximate
  const viewportStart = Math.max(
    0,
    currentLine - Math.floor(linesPerViewport / 2)
  );
  const viewportEnd = Math.min(totalLines, viewportStart + linesPerViewport);
  const viewportTop = (viewportStart / totalLines) * 100;
  const viewportHeight = ((viewportEnd - viewportStart) / totalLines) * 100;

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-[120px] border-l border-border bg-muted/30 overflow-hidden cursor-pointer select-none"
      style={{ height: `${height}px` }}
    >
      {/* Viewport indicator */}
      <div
        className="absolute left-0 right-0 bg-primary/10 border-y border-primary/30 pointer-events-none z-10"
        style={{
          top: `${viewportTop}%`,
          height: `${viewportHeight}%`,
          minHeight: "20px",
        }}
      />

      {/* Hovered line indicator */}
      {hoveredLine !== null && (
        <div
          className="absolute left-0 right-0 bg-accent/20 pointer-events-none z-5"
          style={{
            top: `${(hoveredLine / totalLines) * 100}%`,
            height: `${(1 / totalLines) * 100}%`,
            minHeight: "2px",
          }}
        />
      )}

      {/* Code lines */}
      <div className="relative w-full h-full overflow-hidden">
        {lines.map((line, index) => {
          const lineTop = (index / totalLines) * height;
          const lineHeight = Math.max(height / totalLines, 0.5);
          const isCurrentLine = index === currentLine;

          return (
            <div
              key={index}
              className={`absolute left-0 right-0 text-[3px] leading-none whitespace-nowrap overflow-hidden font-mono ${
                isCurrentLine ? "opacity-100" : "opacity-60"
              }`}
              style={{
                top: `${lineTop}px`,
                height: `${lineHeight}px`,
                fontSize: "3px",
              }}
            >
              <MinimapLine line={line} language={language} />
            </div>
          );
        })}
      </div>

      {/* Line number tooltip */}
      {hoveredLine !== null && (
        <div className="absolute top-2 left-2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg pointer-events-none z-20 border">
          Line {hoveredLine + 1}
        </div>
      )}
    </div>
  );
}

// Minimap line with simple syntax highlighting
function MinimapLine({ line, language }: { line: string; language: string }) {
  if (!line.trim()) {
    return <span className="opacity-0">.</span>;
  }

  // Simple syntax highlighting for minimap
  const tokens = tokenizeLine(line, language);

  return (
    <span className="inline-block px-1">
      {tokens.map((token, i) => (
        <span key={i} className={getTokenColor(token.type)}>
          {token.value}
        </span>
      ))}
    </span>
  );
}

interface Token {
  type: string;
  value: string;
}

function tokenizeLine(line: string, language: string): Token[] {
  const tokens: Token[] = [];

  // Keywords
  const keywords =
    language === "python"
      ? [
          "def",
          "class",
          "import",
          "from",
          "if",
          "else",
          "elif",
          "for",
          "while",
          "return",
          "try",
          "except",
        ]
      : [
          "const",
          "let",
          "var",
          "function",
          "class",
          "if",
          "else",
          "return",
          "import",
          "export",
          "async",
          "await",
          "private",
          "public",
        ];

  // Simple regex-based tokenization
  const regex =
    /(".*?"|'.*?'|\/\/.*|\/\*[\s\S]*?\*\/|\b\d+\b|\b[a-zA-Z_]\w*\b|[{}()\[\];,.])/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(line)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      tokens.push({
        type: "text",
        value: line.substring(lastIndex, match.index),
      });
    }

    const value = match[0];
    let type = "text";

    if (value.startsWith('"') || value.startsWith("'")) {
      type = "string";
    } else if (value.startsWith("//") || value.startsWith("/*")) {
      type = "comment";
    } else if (/^\d+$/.test(value)) {
      type = "number";
    } else if (keywords.includes(value)) {
      type = "keyword";
    } else if (/^[A-Z]/.test(value)) {
      type = "class";
    } else if (/^[a-z_]/.test(value)) {
      type = "identifier";
    }

    tokens.push({ type, value });
    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < line.length) {
    tokens.push({
      type: "text",
      value: line.substring(lastIndex),
    });
  }

  return tokens;
}

function getTokenColor(type: string): string {
  const colors: Record<string, string> = {
    keyword: "text-blue-600 dark:text-blue-400",
    string: "text-green-600 dark:text-green-400",
    comment: "text-gray-500 dark:text-gray-500",
    number: "text-orange-600 dark:text-orange-400",
    class: "text-yellow-600 dark:text-yellow-400",
    identifier: "text-foreground",
    text: "text-foreground",
  };

  return colors[type] || "text-foreground";
}
