import { Loader2, ShieldAlert } from "lucide-react"
import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Section } from "@/components/ui/section"

/**
 * Gates admin routes on a session AND on server-verified admin membership.
 * While either lookup is in flight we render only a neutral loading state —
 * admin content never mounts during the unknown-auth window (no flash of
 * protected data).
 *
 * This is a usability guard, not the security boundary: RLS (`is_admin()` in
 * migration 0006) is what actually keeps non-admin accounts away from the data.
 * Without this check a signed-in stranger would just see an empty admin shell.
 */
export function ProtectedRoute() {
  const { session, loading, isAdmin, signOut } = useAuth()

  if (loading || (session && isAdmin === null)) {
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

  if (!isAdmin) {
    return (
      <Section className="flex min-h-[50vh] items-center justify-center py-16">
        <div className="max-w-sm text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="mt-4 font-display text-xl font-bold tracking-tight text-foreground">
            Acceso restringido
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Su cuenta no tiene permisos administrativos. Comuníquese con el administrador
            de LABMAREMI si cree que se trata de un error.
          </p>
          <Button variant="outline" className="mt-6" onClick={() => void signOut()}>
            Cerrar sesión
          </Button>
        </div>
      </Section>
    )
  }

  return <Outlet />
}
