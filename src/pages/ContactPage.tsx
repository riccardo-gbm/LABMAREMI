import { Link } from "react-router-dom"
import { ArrowRight, Mail, MapPin, MessageCircle, Phone } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Eyebrow } from "@/components/ui/eyebrow"
import { PageHeader } from "@/components/ui/page-header"
import { Section } from "@/components/ui/section"
import {
  coverageSectors,
  EMAIL_DISPLAY,
  PHONE_DISPLAY,
  WHATSAPP_HREF,
} from "@/lib/contact"
import { cn } from "@/lib/utils"

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contacto"
        description="Escríbanos por WhatsApp o correo y le respondemos con la información que necesita para abastecer su negocio."
      />

      <Section className="pt-8 md:pt-10">
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr] lg:items-start">
          {/* Primary channel: WhatsApp */}
          <Card className="flex flex-col items-start bg-primary p-8 text-primary-foreground md:p-10">
            <Eyebrow className="text-primary-foreground/70">
              Canal directo
            </Eyebrow>
            <h2 className="mt-4 font-display text-2xl font-bold tracking-tight md:text-3xl">
              La forma más rápida de contactarnos es por WhatsApp
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-primary-foreground/80">
              Cuéntenos qué necesita su negocio y le respondemos en horario
              laboral. Para una propuesta formal, puede solicitar una
              cotización directamente.
            </p>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "mt-7"
              )}
            >
              <MessageCircle />
              Escribir por WhatsApp
            </a>

            <div className="mt-8 w-full border-t border-primary-foreground/20 pt-6">
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-sm">{PHONE_DISPLAY}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-sm">{EMAIL_DISPLAY}</span>
                </li>
              </ul>
            </div>
          </Card>

          {/* Service area */}
          <Card className="p-8">
            <Eyebrow>Cobertura / Quito-EC</Eyebrow>
            <h2 className="mt-4 font-display text-xl font-bold tracking-tight text-foreground">
              Atendemos Quito y provincias cercanas
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Coordinamos entregas periódicas para que su negocio mantenga su
              stock de limpieza e higiene sin interrupciones, sin importar el
              sector de la ciudad en el que se encuentre.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {coverageSectors.map((sector) => (
                <Badge key={sector} variant="outline" className="gap-1.5">
                  <MapPin className="h-3 w-3 text-ring" aria-hidden="true" />
                  {sector}
                </Badge>
              ))}
            </div>

            <div className="mt-8 border-t pt-6">
              <p className="text-sm text-muted-foreground">
                ¿Ya sabe qué productos necesita?
              </p>
              <Link
                to="/cotizacion"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "group mt-3 w-full"
                )}
              >
                Solicitar cotización
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Card>
        </div>
      </Section>
    </>
  )
}
