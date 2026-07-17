import { AnimatePresence, m } from "framer-motion"
import { CheckCircle2, Clock, FileText, PackageCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Eyebrow } from "@/components/ui/eyebrow"
import { Reveal } from "@/components/ui/reveal"
import { getProductById, getProductCode } from "@/lib/catalog"

type SelectedProduct = NonNullable<ReturnType<typeof getProductById>>

interface QuoteSummaryAsideProps {
  productSummary: number
  selectedProducts: SelectedProduct[]
}

/** Sticky sidebar on the quote form: live selection summary + next steps. */
function QuoteSummaryAside({
  productSummary,
  selectedProducts,
}: QuoteSummaryAsideProps) {
  return (
    <Reveal direction="left" delay={0.08} className="space-y-4 lg:sticky lg:top-24">
      <aside className="space-y-4">
        <Card className="overflow-hidden">
          <div className="border-b bg-secondary/50 px-5 py-4">
            <Eyebrow>Resumen de solicitud</Eyebrow>
            <p className="mt-2 font-display text-xl font-bold tracking-tight text-foreground">
              {productSummary === 0
                ? "Seleccione productos para cotizar"
                : `${productSummary} ${productSummary === 1 ? "producto seleccionado" : "productos seleccionados"}`}
            </p>
          </div>

          <div className="p-5">
            {selectedProducts.length > 0 ? (
              <ul className="space-y-3">
                <AnimatePresence initial={false}>
                  {selectedProducts.map((product) => (
                    <m.li
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="rounded-lg border p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold leading-snug text-foreground">
                          {product.name}
                        </p>
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ring">
                          {getProductCode(product)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {product.presentation}
                      </p>
                    </m.li>
                  ))}
                </AnimatePresence>
              </ul>
            ) : (
              <div className="rounded-lg border border-dashed p-5 text-center">
                <PackageCheck className="mx-auto h-7 w-7 text-primary" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Los productos que marque aparecerán aquí antes de enviar la
                  solicitud.
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <Eyebrow>Qué ocurre después</Eyebrow>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Revisamos productos, presentación y sector de entrega.
            </li>
            <li className="flex gap-3">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Preparamos una cotización formal para su negocio.
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Coordinamos seguimiento por WhatsApp o correo.
            </li>
          </ul>
          <Badge variant="secondary" className="mt-5">
            Demo Fase 1 · sin persistencia real
          </Badge>
        </Card>
      </aside>
    </Reveal>
  )
}

export { QuoteSummaryAside }
