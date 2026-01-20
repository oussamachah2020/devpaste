import { useRef, useState, useEffect } from "react";
import Editor from "react-simple-code-editor";
import { CodeMinimap } from "./CodeMinimap";

interface EditorWithMinimapProps {
  value: string;
  onValueChange: (value: string) => void;
  highlight: (code: string) => string;
  language: string;
  readOnly?: boolean;
  placeholder?: string;
  showMinimap?: boolean;
}

export function EditorWithMinimap({
  value,
  onValueChange,
  highlight,
  language,
  readOnly = false,
  placeholder,
  showMinimap = true,
}: EditorWithMinimapProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [currentLine, setCurrentLine] = useState(0);
  const [editorHeight, setEditorHeight] = useState(420);

  // Track cursor position to update current line
  useEffect(() => {
    const handleSelectionChange = () => {
      const textarea = editorRef.current?.querySelector("textarea");
      if (!textarea) return;

      const textBeforeCursor = value.substring(0, textarea.selectionStart);
      const lines = textBeforeCursor.split("\n");
      setCurrentLine(lines.length - 1);
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, [value]);

  // Update editor height based on content
  useEffect(() => {
    const lines = value.split("\n").length;
    const calculatedHeight = Math.max(420, Math.min(lines * 21, 800));
    setEditorHeight(calculatedHeight);
  }, [value]);

  const handleLineClick = (lineNumber: number) => {
    const textarea = editorRef.current?.querySelector("textarea");
    if (!textarea) return;

    const lines = value.split("\n");
    const textBeforeLine = lines.slice(0, lineNumber).join("\n");
    const cursorPosition = textBeforeLine.length + (lineNumber > 0 ? 1 : 0);

    textarea.focus();
    textarea.setSelectionRange(cursorPosition, cursorPosition);

    // Scroll to line
    const lineHeight = 21;
    textarea.scrollTop = lineNumber * lineHeight - textarea.clientHeight / 2;
  };

  // Only show minimap if code has more than 20 lines
  const shouldShowMinimap = showMinimap && value.split("\n").length > 20;

  return (
    <div className="flex border-2 rounded-lg overflow-hidden bg-[#2d2d2d] ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      {/* Editor */}
      <div ref={editorRef} className="flex-1 overflow-hidden">
        <Editor
          value={value}
          onValueChange={onValueChange}
          highlight={highlight}
          padding={20}
          readOnly={readOnly}
          placeholder={placeholder}
          style={{
            fontFamily:
              '"Fira Code", "JetBrains Mono", Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
            fontSize: 14,
            minHeight: `${editorHeight}px`,
            maxHeight: `${editorHeight}px`,
            lineHeight: "1.5",
            backgroundColor: "#2d2d2d",
            color: "#f8f8f2",
            overflow: "auto",
          }}
          textareaClassName="focus:outline-none"
        />
      </div>

      {/* Minimap */}
      {shouldShowMinimap && (
        <CodeMinimap
          code={value}
          currentLine={currentLine}
          onLineClick={handleLineClick}
          height={editorHeight}
          language={language}
        />
      )}
    </div>
  );
}
