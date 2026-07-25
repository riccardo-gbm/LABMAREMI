import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface QueryErrorProps {
  onRetry: () => void
  /** Overrides the default headline when a page needs more specific wording. */
  title?: string
  description?: string
  className?: string
}

/**
 * Shared failed-fetch state: a friendly Spanish message and a retry action,
 * never a blank screen. Used by every page that reads from Supabase.
 */
function QueryError({
  onRetry,
  title = "No se pudieron cargar los datos.",
  description = "Verifique su conexión e intente nuevamente.",
  className,
}: QueryErrorProps) {
  return (
    <Card
      role="alert"
      className={cn("flex flex-col items-center gap-4 p-10 text-center", className)}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Button onClick={onRetry}>Reintentar</Button>
    </Card>
  )
}

export { QueryError }
