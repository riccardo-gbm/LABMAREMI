import { type FormEvent, useId, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Eyebrow } from "@/components/ui/eyebrow"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/ui/page-header"
import { Section } from "@/components/ui/section"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ProductPicker } from "@/components/quote/ProductPicker"
import { QuoteSuccess } from "@/components/quote/QuoteSuccess"
import { businessTypes } from "@/data/businessTypes"
import { getProductById } from "@/lib/catalog"

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
          className="mx-auto max-w-3xl"
        >
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
                {productsError ? (
                  <p
                    id={productsErrorId}
                    role="alert"
                    className="text-sm font-medium text-destructive"
                  >
                    Seleccione al menos un producto de interés.
                  </p>
                ) : null}
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
        </form>
      </Section>
    </>
  )
}
