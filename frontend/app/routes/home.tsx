import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { pasteApi, type CreatePasteDto } from "../../lib/api";
import { detectLanguage } from "../../lib/languageDetector";
import toast from "react-hot-toast";
import Prism from "prismjs";

// shadcn components
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Loader2,
  Sparkles,
  Flame,
  Lock,
  Code2,
  Zap,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";

// Custom components
import { EditorWithMinimap } from "../components/EditorWithMinimap";

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

const LANGUAGES = [
  "plaintext",
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
];

export default function HomePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreatePasteDto>({
    title: "",
    content: "",
    language: "javascript",
    expiresIn: "1day",
  });
  const [isAutoDetecting, setIsAutoDetecting] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const createMutation = useMutation({
    mutationFn: pasteApi.create,
    onSuccess: (response) => {
      toast.success("Paste created! 🎉");
      navigate(`/paste/${response.data.id}`);
    },
    onError: () => {
      toast.error("Failed to create paste");
    },
  });

  // Auto-detect language when content changes
  useEffect(() => {
    if (isAutoDetecting && formData.content.trim().length > 20) {
      const detected = detectLanguage(formData.content);
      if (detected !== formData.language && detected !== "plaintext") {
        setFormData((prev) => ({ ...prev, language: detected }));
        toast.success(`Detected: ${detected}`, {
          duration: 2000,
          icon: "🤖",
        });
      }
    }
  }, [formData.content, isAutoDetecting]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      toast.error("Content cannot be empty");
      return;
    }

    // Validate password if provided
    if (formData.password && formData.password.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }

    createMutation.mutate(formData);
  };;

  const handleLanguageChange = (language: string) => {
    setFormData({ ...formData, language });
    setIsAutoDetecting(false);
    toast("Auto-detection disabled", { duration: 2000 });
  };

  const toggleAutoDetection = () => {
    setIsAutoDetecting(!isAutoDetecting);
    toast.success(
      isAutoDetecting ? "Auto-detection disabled" : "Auto-detection enabled",
      { icon: isAutoDetecting ? "🔴" : "🟢" }
    );
  };

  const highlightCode = (code: string) => {
    try {
      const language =
        formData.language === "plaintext" ? "javascript" : formData.language;
      return Prism.highlight(
        code,
        Prism.languages[language as any] || Prism.languages.javascript,
        language as any
      );
    } catch {
      return code;
    }
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12 space-y-4">
        <Badge variant="secondary" className="mb-4">
          <Code2 className="w-3 h-3 mr-1" />
          Share code instantly
        </Badge>

        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          DevPaste
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Beautiful code sharing for developers. Paste your code, get a link,
          share it anywhere.
        </p>
      </div>

      {/* Main Form Card */}
      <Card className="border-2 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardTitle>Create New Paste</CardTitle>
          <CardDescription>
            Share code snippets with syntax highlighting and optional privacy
            settings
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="My awesome code snippet"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="text-lg"
              />
            </div>

            {/* Language & Expiry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Language Select */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="language">Language</Label>
                  <Button
                    type="button"
                    variant={isAutoDetecting ? "default" : "outline"}
                    size="sm"
                    onClick={toggleAutoDetection}
                    className="h-7 text-xs"
                  >
                    {isAutoDetecting
                      ? "🤖 Auto-detect ON"
                      : "🔴 Auto-detect OFF"}
                  </Button>
                </div>
                <Select
                  value={formData.language}
                  onValueChange={handleLanguageChange}
                >
                  <SelectTrigger id="language" className="capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem
                        key={lang}
                        value={lang}
                        className="capitalize"
                      >
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Expiry Select */}
              <div className="space-y-2">
                <Label htmlFor="expires">Expires In</Label>
                <Select
                  value={formData.expiresIn}
                  onValueChange={(value) =>
                    setFormData({ ...formData, expiresIn: value as any })
                  }
                >
                  <SelectTrigger id="expires">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1hour">1 Hour</SelectItem>
                    <SelectItem value="1day">1 Day</SelectItem>
                    <SelectItem value="1week">1 Week</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Code Editor with Minimap */}
            <div className="space-y-2">
              <Label htmlFor="code">Your Code</Label>
              <EditorWithMinimap
                value={formData.content}
                onValueChange={(code) =>
                  setFormData({ ...formData, content: code })
                }
                highlight={highlightCode}
                language={formData.language}
                placeholder="// Paste your code here...
console.log('Hello, DevPaste!');"
                showMinimap={true}
              />
            </div>

            {/* Options */}
            <Card className="bg-muted/50">
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Burn After Read */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="burn"
                      checked={formData.burnAfterRead || false}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          burnAfterRead: checked as boolean,
                        })
                      }
                    />
                    <label
                      htmlFor="burn"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                    >
                      <Flame className="w-4 h-4 text-orange-500" />
                      Burn after reading
                    </label>
                  </div>

                  {/* Private */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="private"
                      checked={formData.isPrivate || false}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          isPrivate: checked as boolean,
                        })
                      }
                    />
                    <label
                      htmlFor="private"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                    >
                      <Lock className="w-4 h-4 text-purple-500" />
                      Private (unlisted)
                    </label>
                  </div>
                </div>

                {/* Password Protection - NEW! */}
                <div className="pt-4 border-t">
                  <div className="flex items-center space-x-2 mb-3">
                    <KeyRound className="w-4 h-4 text-blue-500" />
                    <Label htmlFor="password" className="text-sm font-semibold">
                      Password Protection{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </Label>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password to protect this paste"
                      value={formData.password || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          password: e.target.value || undefined,
                        })
                      }
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {formData.password && (
                    <p className="text-xs text-muted-foreground mt-2">
                      💡 Viewers will need this password to see your code
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating your paste...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Create Paste
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-2">
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-lg">Syntax Highlighting</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Support for 10+ programming languages with beautiful syntax
              highlighting
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-2">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-lg">Private & Secure</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create private pastes or burn-after-read for sensitive code
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-2">
              <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-lg">Developer Friendly</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Clean URLs, raw text view, and API access for automation
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
