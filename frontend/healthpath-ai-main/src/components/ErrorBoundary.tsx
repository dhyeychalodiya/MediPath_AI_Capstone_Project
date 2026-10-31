import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 shadow-soft space-y-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message || "An unexpected error occurred while rendering this page."}
            </p>
            {this.state.error?.stack && (
              <pre className="text-xs bg-muted p-3 rounded-lg text-left overflow-x-auto max-h-32 text-muted-foreground font-mono">
                {this.state.error.stack}
              </pre>
            )}
            <Button onClick={this.handleReset} className="gap-2 w-full">
              <RotateCcw className="w-4 h-4" /> Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
