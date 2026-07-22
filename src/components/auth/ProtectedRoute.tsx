import { Loader2 } from "lucide-react"
import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "@/components/auth/AuthProvider"
import { Section } from "@/components/ui/section"

/**
 * Gates admin routes on the Supabase session. While the initial session lookup
 * is in flight we render only a neutral loading state — admin content never
 * mounts during the unknown-auth window (no flash of protected data).
 */
export function ProtectedRoute() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <Section className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span className="text-sm">Verificando acceso…</span>
        </div>
      </Section>
    )
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
