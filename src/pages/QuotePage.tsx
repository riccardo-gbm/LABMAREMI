import { type FormEvent, useId, useMemo, useReducer, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { AnimatePresence, m } from "framer-motion"

import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
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
import { QuoteSummaryAside } from "@/components/quote/QuoteSummaryAside"
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

interface QuoteFormState {
  companyName: string
  contactPerson: string
  phone: string
  email: string
  businessTypeId: string
  location: string
  productsOfInterest: string[]
  message: string
}

// These text fields always move together as one "quote form" unit, so a single
// reducer keeps the transitions (edit a field / set products / reset) in one
// place instead of ten scattered setState calls.
type QuoteTextField = Exclude<keyof QuoteFormState, "productsOfInterest">

type QuoteFormAction =
  | { type: "setField"; field: QuoteTextField; value: string }
  | { type: "setProducts"; value: string[] }
  | { type: "reset" }

function createInitialFormState(rawProducts: string | null): QuoteFormState {
  return {
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    businessTypeId: "",
    location: "",
    productsOfInterest: parseInitialProducts(rawProducts),
    message: "",
  }
}

function quoteFormReducer(
  state: QuoteFormState,
  action: QuoteFormAction
): QuoteFormState {
  switch (action.type) {
    case "setField":
      return { ...state, [action.field]: action.value }
    case "setProducts":
      return { ...state, productsOfInterest: action.value }
    case "reset":
      return createInitialFormState(null)
    default:
      return state
  }
}

export default function QuotePage() {
  const [searchParams] = useSearchParams()
  const productsErrorId = useId()

  const [form, dispatch] = useReducer(
    quoteFormReducer,
    searchParams.get(PRODUCTS_PARAM),
    createInitialFormState
  )

  const [productsError, setProductsError] = useState(false)
  const productsPickerRef = useRef<HTMLDivElement>(null)

  const [submission, setSubmission] = useState<{
    companyName: string
    productCount: number
    referenceCode: string
  } | null>(null)

  const productSummary = useMemo(
    () => form.productsOfInterest.length,
    [form.productsOfInterest]
  )

  const selectedProducts = useMemo(
    () =>
      form.productsOfInterest
        .map((productId) => getProductById(productId))
        .filter((product) => product !== undefined),
    [form.productsOfInterest]
  )

  const setField = (field: QuoteTextField) => (
    event: { target: { value: string } }
  ) => dispatch({ type: "setField", field, value: event.target.value })

  const resetForm = () => {
    dispatch({ type: "reset" })
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

    if (form.productsOfInterest.length === 0) {
      setProductsError(true)
      productsPickerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
      return
    }

    setSubmission({
      companyName: form.companyName,
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
                  value={form.companyName}
                  onChange={setField("companyName")}
                  placeholder="Ej. Restaurante Sabor Andino"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contactPerson">Persona de contacto *</Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  required
                  value={form.contactPerson}
                  onChange={setField("contactPerson")}
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
                  value={form.phone}
                  onChange={setField("phone")}
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
                  value={form.email}
                  onChange={setField("email")}
                  placeholder="empresa@correo.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="businessTypeId">Tipo de negocio *</Label>
                <Select
                  id="businessTypeId"
                  name="businessTypeId"
                  required
                  value={form.businessTypeId}
                  onChange={setField("businessTypeId")}
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
                  value={form.location}
                  onChange={setField("location")}
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
                  value={form.productsOfInterest}
                  onChange={(next) => {
                    dispatch({ type: "setProducts", value: next })
                    if (next.length > 0) setProductsError(false)
                  }}
                  errorId={productsError ? productsErrorId : undefined}
                />
                <AnimatePresence>
                {productsError ? (
                  <m.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    id={productsErrorId}
                    role="alert"
                    className="text-sm font-medium text-destructive"
                  >
                    Seleccione al menos un producto de interés.
                  </m.p>
                ) : null}
                </AnimatePresence>
              </div>

              <div className="mt-5 space-y-1.5">
                <Label htmlFor="message">Mensaje</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={setField("message")}
                  placeholder="Cuéntenos cualquier detalle adicional sobre su pedido (cantidades, frecuencia, plazos)…"
                />
              </div>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              * Campos obligatorios
            </p>

            <InteractiveHoverButton
              type="submit"
              text="Enviar solicitud"
              size="lg"
              className="mt-6 w-full sm:w-auto"
            />
          </Card>
          </Reveal>

          <QuoteSummaryAside
            productSummary={productSummary}
            selectedProducts={selectedProducts}
          />
        </form>
      </Section>
    </>
  )
}
