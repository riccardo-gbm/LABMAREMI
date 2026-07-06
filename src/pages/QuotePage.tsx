import { type FormEvent, useId, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, CheckCircle2, Clock, FileText, PackageCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Eyebrow } from "@/components/ui/eyebrow"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/ui/page-header"
import { Reveal } from "@/components/ui/reveal"
import { Section } from "@/components/ui/section"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ProductPicker } from "@/components/quote/ProductPicker"
import { QuoteSuccess } from "@/components/quote/QuoteSuccess"
import { businessTypes } from "@/data/businessTypes"
import { getProductById, getProductCode } from "@/lib/catalog"

const PRODUCTS_PARAM = "productos"

function generateReferenceCode(): string {
  const now = new Date()
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`
  const randomPart = Math.floor(1000 + Math.random() * 9000)
  return `SOL-${datePart}-${randomPart}`
}

function parseInitialProducts(raw: string | null): string[] {
  return (raw ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => getProductById(id) !== undefined)
}

export default function QuotePage() {
  const [searchParams] = useSearchParams()
  const productsErrorId = useId()

  const [companyName, setCompanyName] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [businessTypeId, setBusinessTypeId] = useState("")
  const [location, setLocation] = useState("")
  const [productsOfInterest, setProductsOfInterest] = useState<string[]>(() =>
    parseInitialProducts(searchParams.get(PRODUCTS_PARAM))
  )
  const [message, setMessage] = useState("")

  const [productsError, setProductsError] = useState(false)
  const productsPickerRef = useRef<HTMLDivElement>(null)

  const [submission, setSubmission] = useState<{
    companyName: string
    productCount: number
    referenceCode: string
  } | null>(null)

  const productSummary = useMemo(
    () => productsOfInterest.length,
    [productsOfInterest]
  )

  const selectedProducts = useMemo(
    () =>
      productsOfInterest
        .map((productId) => getProductById(productId))
        .filter((product) => product !== undefined),
    [productsOfInterest]
  )

  const resetForm = () => {
    setCompanyName("")
    setContactPerson("")
    setPhone("")
    setEmail("")
    setBusinessTypeId("")
    setLocation("")
    setProductsOfInterest([])
    setMessage("")
    setProductsError(false)
    setSubmission(null)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Native HTML5 constraints (required, type="email", type="tel" + pattern)
    // already cover the plain text fields — reportValidity() surfaces the
    // browser's built-in validation UI for those. The product picker is a
    // custom widget HTML5 can't validate, so it gets one manual check here.
    if (!event.currentTarget.reportValidity()) {
      return
    }

    if (productsOfInterest.length === 0) {
      setProductsError(true)
      productsPickerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
      return
    }

    setSubmission({
      companyName,
      productCount: productSummary,
      referenceCode: generateReferenceCode(),
    })
  }

  if (submission) {
    return (
      <>
        <PageHeader
          title="Solicitar cotización"
          description="Complete el formulario y nuestro equipo le enviará una propuesta a la medida de su negocio."
        />
        <Section className="pt-8 md:pt-10">
          <div className="mx-auto max-w-2xl">
            <QuoteSuccess
              companyName={submission.companyName}
              productCount={submission.productCount}
              referenceCode={submission.referenceCode}
              onReset={resetForm}
            />
          </div>
        </Section>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Solicitar cotización"
        description="Complete el formulario y nuestro equipo le enviará una propuesta a la medida de su negocio."
      />

      <Section className="pt-8 md:pt-10">
        <form
          noValidate={false}
          onSubmit={handleSubmit}
          className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start"
        >
          <Reveal>
          <Card className="p-6 md:p-8">
            <Eyebrow>Datos de la empresa</Eyebrow>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="companyName">Nombre de la empresa *</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ej. Restaurante Sabor Andino"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contactPerson">Persona de contacto *</Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Nombre de quien solicita"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  pattern="^\+?[0-9\s]{7,15}$"
                  title="Ingrese un número de teléfono válido, ej. +593 99 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+593 99 123 4567"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Correo electrónico *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="empresa@correo.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="businessTypeId">Tipo de negocio *</Label>
                <Select
                  id="businessTypeId"
                  name="businessTypeId"
                  required
                  value={businessTypeId}
                  onChange={(e) => setBusinessTypeId(e.target.value)}
                >
                  <option value="" disabled>
                    Seleccione una opción
                  </option>
                  {businessTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">Ubicación / sector *</Label>
                <Input
                  id="location"
                  name="location"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej. Cumbayá, Quito"
                />
              </div>
            </div>

            <div className="mt-8 border-t pt-8">
              <Eyebrow>Detalle de la solicitud</Eyebrow>

              <div ref={productsPickerRef} className="mt-5 space-y-1.5">
                <Label id={`${productsErrorId}-label`}>
                  Productos de interés *
                </Label>
                <ProductPicker
                  value={productsOfInterest}
                  onChange={(next) => {
                    setProductsOfInterest(next)
                    if (next.length > 0) setProductsError(false)
                  }}
                  errorId={productsError ? productsErrorId : undefined}
                />
                <AnimatePresence>
                {productsError ? (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    id={productsErrorId}
                    role="alert"
                    className="text-sm font-medium text-destructive"
                  >
                    Seleccione al menos un producto de interés.
                  </motion.p>
                ) : null}
                </AnimatePresence>
              </div>

              <div className="mt-5 space-y-1.5">
                <Label htmlFor="message">Mensaje</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Cuéntenos cualquier detalle adicional sobre su pedido (cantidades, frecuencia, plazos)…"
                />
              </div>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              * Campos obligatorios
            </p>

            <Button type="submit" size="lg" className="group mt-6 w-full sm:w-auto">
              Enviar solicitud
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Card>
          </Reveal>

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
                      <motion.li
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
                      </motion.li>
                    ))}
                    </AnimatePresence>
                  </ul>
                ) : (
                  <div className="rounded-lg border border-dashed p-5 text-center">
                    <PackageCheck className="mx-auto h-7 w-7 text-primary" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      Los productos que marque aparecerán aquí antes de enviar la solicitud.
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
        </form>
      </Section>
    </>
  )
}
