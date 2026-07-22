import { useState } from "react"
import type { FormEvent } from "react"
import { Loader2, Lock } from "lucide-react"
import { Navigate, useNavigate } from "react-router-dom"

import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Section } from "@/components/ui/section"
import { supabase } from "@/lib/supabase"

export default function AdminLoginPage() {
  const { session, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Already signed in — no reason to show the form.
  if (!authLoading && session) {
    return <Navigate to="/admin" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError) {
      // Generic on purpose — never reveal whether the email exists.
      setError("Credenciales incorrectas.")
      setSubmitting(false)
      return
    }

    navigate("/admin", { replace: true })
  }

  return (
    <Section className="flex min-h-[60vh] items-center justify-center py-16">
      <Card className="w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="mt-4 font-display text-xl font-bold tracking-tight text-foreground">
            Acceso administrativo
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ingrese sus credenciales para continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Ingresando…
              </>
            ) : (
              "Ingresar"
            )}
          </Button>
        </form>
      </Card>
    </Section>
  )
}
