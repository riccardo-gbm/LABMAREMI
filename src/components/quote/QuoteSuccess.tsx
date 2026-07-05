import { CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Eyebrow } from "@/components/ui/eyebrow"

interface QuoteSuccessProps {
  companyName: string
  productCount: number
  referenceCode: string
  onReset: () => void
}

/**
 * Post-submit confirmation. Phase 1 has no backend, so copy is careful to
 * read as "we received this and will follow up" rather than implying the
 * request was saved anywhere — the reference code is a cosmetic UI touch,
 * not a persisted record id.
 */
function QuoteSuccess({
  companyName,
  productCount,
  referenceCode,
  onReset,
}: QuoteSuccessProps) {
  return (
    <Card className="flex flex-col items-center px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
        <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
      </span>

      <h2 className="mt-6 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        Solicitud enviada
      </h2>

      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Hemos recibido la solicitud de{" "}
        <span className="font-medium text-foreground">{companyName}</span> con{" "}
        {productCount === 1
          ? "1 producto de interés"
          : `${productCount} productos de interés`}
        . Nuestro equipo comercial se pondrá en contacto a la brevedad para
        conversar sobre precios y disponibilidad.
      </p>

      <div className="mt-6 rounded-lg border bg-secondary/40 px-5 py-3">
        <Eyebrow className="justify-center">Referencia de esta solicitud</Eyebrow>
        <p className="mt-1.5 font-mono text-lg tracking-widest text-foreground">
          {referenceCode}
        </p>
      </div>

      <Button variant="outline" className="mt-8" onClick={onReset}>
        Enviar otra solicitud
      </Button>
    </Card>
  )
}

export { QuoteSuccess }
