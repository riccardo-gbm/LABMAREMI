import { useState } from "react"
import { LogOut } from "lucide-react"
import { Outlet, useNavigate } from "react-router-dom"

import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"

/**
 * Chrome shared by every authenticated admin route: a slim bar with the signed-in
 * admin's email and a logout control. Sits inside ProtectedRoute, so it only ever
 * renders for an authenticated user.
 */
export function AdminLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    navigate("/admin/login", { replace: true })
  }

  return (
    <>
      <div className="border-b bg-muted/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Sesión de administrador
            {user?.email ? (
              <span className="ml-2 normal-case tracking-normal text-foreground">
                {user.email}
              </span>
            ) : null}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {signingOut ? "Cerrando…" : "Cerrar sesión"}
          </Button>
        </div>
      </div>
      <Outlet />
    </>
  )
}
