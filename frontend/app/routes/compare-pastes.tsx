import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { pasteApi } from "../../lib/api";
import ReactDiffViewer from "react-diff-viewer-continued";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Loader2, ArrowLeftRight, Code2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ComparePastes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [leftId, setLeftId] = useState(searchParams.get("left") || "");
  const [rightId, setRightId] = useState(searchParams.get("right") || "");
  const [compareMode, setCompareMode] = useState(false);

  // Fetch left paste
  const { data: leftPaste, isLoading: leftLoading } = useQuery({
    queryKey: ["paste", leftId],
    queryFn: () => pasteApi.getById(leftId),
    enabled: compareMode && !!leftId,
  });

  // Fetch right paste
  const { data: rightPaste, isLoading: rightLoading } = useQuery({
    queryKey: ["paste", rightId],
    queryFn: () => pasteApi.getById(rightId),
    enabled: compareMode && !!rightId,
  });

  const handleCompare = () => {
    if (!leftId || !rightId) {
      toast.error("Please enter both paste IDs");
      return;
    }

    if (leftId === rightId) {
      toast.error("Please enter different paste IDs");
      return;
    }

    setSearchParams({ left: leftId, right: rightId });
    setCompareMode(true);
  };

  const isLoading = leftLoading || rightLoading;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5" />
                Compare Pastes
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Compare two code snippets side by side
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Paste ID */}
            <div className="space-y-2">
              <Label htmlFor="left">Original Paste ID</Label>
              <Input
                id="left"
                placeholder="Enter first paste ID"
                value={leftId}
                onChange={(e) => setLeftId(e.target.value)}
              />
            </div>

            {/* Right Paste ID */}
            <div className="space-y-2">
              <Label htmlFor="right">Modified Paste ID</Label>
              <Input
                id="right"
                placeholder="Enter second paste ID"
                value={rightId}
                onChange={(e) => setRightId(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleCompare}
            className="w-full mt-4"
            disabled={!leftId || !rightId || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                Compare
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Diff Viewer */}
      {compareMode && !isLoading && leftPaste && rightPaste && (
        <>
          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Original</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    <Code2 className="w-3 h-3 mr-1" />
                    {leftPaste.language}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {leftPaste.title || "Untitled"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Modified</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    <Code2 className="w-3 h-3 mr-1" />
                    {rightPaste.language}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {rightPaste.title || "Untitled"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Diff Display */}
          <Card>
            <CardContent className="p-0">
              <ReactDiffViewer
                oldValue={leftPaste.content || ""}
                newValue={rightPaste.content || ""}
                splitView={true}
                showDiffOnly={false}
                useDarkTheme={false}
                leftTitle="Original"
                rightTitle="Modified"
                styles={{
                  variables: {
                    light: {
                      diffViewerBackground: "#fff",
                      diffViewerColor: "#212529",
                      addedBackground: "#e6ffed",
                      addedColor: "#24292e",
                      removedBackground: "#ffeef0",
                      removedColor: "#24292e",
                      wordAddedBackground: "#acf2bd",
                      wordRemovedBackground: "#fdb8c0",
                      addedGutterBackground: "#cdffd8",
                      removedGutterBackground: "#ffdce0",
                      gutterBackground: "#f7f7f7",
                      gutterBackgroundDark: "#f3f1f1",
                      highlightBackground: "#fffbdd",
                      highlightGutterBackground: "#fff5b1",
                    },
                  },
                  line: {
                    fontFamily:
                      '"Fira Code", "JetBrains Mono", Monaco, Menlo, monospace',
                    fontSize: "14px",
                  },
                }}
              />
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!compareMode && (
        <Card>
          <CardContent className="py-12 text-center">
            <ArrowLeftRight className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              Enter Paste IDs to Compare
            </h3>
            <p className="text-muted-foreground">
              See the differences between two code snippets side by side
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
