import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminQueryErrorProps {
  onRetry: () => void;
  message?: string;
}

/** Explicit recovery state for failed admin data queries; never disguises errors as empty lists. */
export function AdminQueryError({
  onRetry,
  message = "We couldn't load these records. Check your connection and try again.",
}: AdminQueryErrorProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-5 py-12 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="max-w-md space-y-1">
        <p className="text-sm font-semibold text-foreground">Records unavailable</p>
        <p className="text-sm leading-6 text-muted-foreground">{message}</p>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
        Try again
      </Button>
    </div>
  );
}
