import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { pasteApi } from "../../lib/api";
import { downloadPaste } from "../../lib/download";
import toast from "react-hot-toast";
import Prism from "prismjs";
import { PasswordDialog } from "../components/PasswordDialog";
import { EditorWithMinimap } from "../components/EditorWithMinimap";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Copy,
  Download,
  Code2,
  Clock,
  Flame,
  Lock,
  KeyRound,
  Loader2,
  Wand2,
  ArrowLeftRight,
} from "lucide-react";

// Import Prism languages
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-json";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-markdown";
import { formatCode, isFormattable } from "@/lib/formatter";

export default function ViewPastePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState<string | undefined>();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [formattedContent, setFormattedContent] = useState<string | null>(null);
  const [isFormatting, setIsFormatting] = useState(false);

  const {
    data: existingPaste, // ✅ CHANGED: Directly use paste, not existingPaste?.data
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["paste", id, password],
    queryFn: async () => {
      const data = await pasteApi.getById(id!, password);
      return data;
    },
    enabled: !!id,
    retry: false,
  });

  const paste = existingPaste?.data;

  useEffect(() => {
    if (paste && paste.hasPassword && !paste.content && !password) {
      setShowPasswordDialog(true);
    }
  }, [paste, password]);

  const handlePasswordSubmit = async (submittedPassword: string) => {
    setIsVerifyingPassword(true);
    setPasswordError(undefined);
    setPassword(submittedPassword);

    try {
      const result = await pasteApi.getById(id!, submittedPassword);

      if (result.content) {
        setShowPasswordDialog(false);
        setPasswordError(undefined);
        setIsVerifyingPassword(false);
        refetch();
      }
    } catch (err: any) {
      setIsVerifyingPassword(false);

      if (err.response?.status === 401) {
        setPasswordError("Incorrect password. Please try again.");
        setPassword(undefined);
      } else {
        setPasswordError("An error occurred. Please try again.");
      }
    }
  };

  const handleFormat = () => {
    if (!paste?.content) return;

    if (!isFormattable(paste.language)) {
      toast.error(`Formatting not supported for ${paste.language}`);
      return;
    }

    setIsFormatting(true);

    try {
      const formatted = formatCode(paste.content, paste.language);
      setFormattedContent(formatted);
      toast.success("Code formatted! ✨");
    } catch (error: any) {
      toast.error(error.message || "Failed to format code");
    } finally {
      setIsFormatting(false);
    }
  };

  const handleCopy = async () => {
    if (paste?.content) {
      await navigator.clipboard.writeText(paste.content);
      toast.success("Copied to clipboard!");
    }
  };

  const handleDownload = () => {
    if (!paste) return;

    downloadPaste(paste.content, paste.title || `paste-${id}`, paste.language);

    toast.success("Downloaded!");
  };

  const highlightCode = (code: string) => {
    if (!paste) return code;

    try {
      const language =
        paste.language === "plaintext" ? "javascript" : paste.language;
      return Prism.highlight(
        code,
        Prism.languages[language as any] || Prism.languages.javascript,
        language as any
      );
    } catch {
      return code;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading paste...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const err = error as any;
    const errorMessage =
      err.response?.status === 404
        ? "Paste not found or has expired"
        : "Failed to load paste";

    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-destructive mb-2">
                {err.response?.status || "Error"}
              </h1>
              <p className="text-muted-foreground">{errorMessage}</p>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No paste data
  if (!paste) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-destructive mb-2">404</h1>
              <p className="text-muted-foreground">Paste not found</p>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ CHANGED: Check hasPassword instead of password
  // Show password dialog if paste is locked
  if (paste.hasPassword && !paste.content) {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Show paste metadata */}
        <Card className="border-2 mb-4">
          <CardHeader>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                <KeyRound className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {paste.title || "Untitled Paste"}
                </h1>
                <p className="text-muted-foreground mb-4">
                  This paste is password protected
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    <Code2 className="w-3 h-3 mr-1" />
                    {paste.language}
                  </Badge>
                  <Badge variant="default">
                    <KeyRound className="w-3 h-3 mr-1" />
                    Password protected
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Password Dialog */}
        <PasswordDialog
          open={showPasswordDialog}
          onSubmit={handlePasswordSubmit}
          isLoading={isVerifyingPassword}
          error={passwordError}
        />
      </div>
    );
  }

  // Display unlocked paste
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <Card className="border-2 mb-4">
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-3">
                {paste.title || "Untitled Paste"}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary" className="capitalize">
                  <Code2 className="w-3 h-3 mr-1" />
                  {paste.language}
                </Badge>

                <Badge variant="outline">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(paste.createdAt).toLocaleDateString()}
                </Badge>

                {paste.expiresAt && (
                  <Badge variant="outline">
                    ⏰ Expires: {new Date(paste.expiresAt).toLocaleDateString()}
                  </Badge>
                )}

                {paste.burnAfterRead && (
                  <Badge variant="destructive">
                    <Flame className="w-3 h-3 mr-1" />
                    Burn after read
                  </Badge>
                )}

                {paste.isPrivate && (
                  <Badge variant="secondary">
                    <Lock className="w-3 h-3 mr-1" />
                    Private
                  </Badge>
                )}

                {paste.hasPassword && (
                  <Badge variant="default">
                    <KeyRound className="w-3 h-3 mr-1" />
                    Password protected
                  </Badge>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button onClick={handleCopy} size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>

              <Button onClick={handleDownload} size="sm" variant="secondary">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>

              {isFormattable(paste.language) && (
                <Button
                  onClick={handleFormat}
                  size="sm"
                  variant="outline"
                  disabled={isFormatting}
                >
                  {isFormatting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4 mr-2" />
                  )}
                  Format
                </Button>
              )}
              <Button size="sm" variant="outline" asChild>
                <a href={`/compare?left=${id}`}>
                  <ArrowLeftRight className="w-4 h-4 mr-2" />
                  Compare
                </a>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Code Editor with Minimap */}
      <EditorWithMinimap
        value={formattedContent || paste.content || ""}
        onValueChange={() => {}}
        highlight={highlightCode}
        language={paste.language}
        readOnly
        showMinimap={true}
      />
    </div>
  );
}
