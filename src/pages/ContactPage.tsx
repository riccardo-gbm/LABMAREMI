import { Mail, MapPin, MessageCircle, Phone } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  InteractiveHoverAnchor,
  InteractiveHoverLink,
} from "@/components/ui/interactive-hover-button"
import { Card } from "@/components/ui/card"
import { Eyebrow } from "@/components/ui/eyebrow"
import { MediaFrame } from "@/components/ui/media-frame"
import { PageHeader } from "@/components/ui/page-header"
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal"
import { Section } from "@/components/ui/section"
import {
  coverageSectors,
  EMAIL_DISPLAY,
  OFFICE_MAP_SRC,
  PHONE_DISPLAY,
  WHATSAPP_HREF,
} from "@/lib/contact"

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contacto"
        description="Escríbanos por WhatsApp o correo y le respondemos con la información que necesita para abastecer su negocio."
      />

      <Section className="pt-8 md:pt-10">
        <RevealGroup className="grid gap-6 lg:grid-cols-2 lg:items-stretch" stagger={0.08}>
          <RevealItem className="flex">
          <Card className="relative flex h-full w-full overflow-hidden bg-primary p-8 text-primary-foreground md:p-10">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative z-10 flex h-full flex-col items-start">
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
              <InteractiveHoverAnchor
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noreferrer"
                text="Escribir por WhatsApp"
                variant="secondary"
                size="lg"
                icon={<MessageCircle aria-hidden="true" />}
                className="mt-7"
              />

              <div className="mt-auto w-full border-t border-primary-foreground/20 pt-6">
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
            </div>
          </Card>
          </RevealItem>

          <RevealItem className="flex">
          <Card className="flex h-full w-full flex-col overflow-hidden">
            <MediaFrame
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=900&auto=format&fit=crop"
              alt="Equipo operativo coordinando servicios de limpieza"
              fallbackLabel="Imagen referencial de cobertura operativa"
              fallbackIcon={MapPin}
              badge="Quito-EC"
              className="aspect-[16/10] rounded-b-none border-0 border-b"
            />
            <div className="flex flex-1 flex-col p-6">
              <Eyebrow>Cobertura</Eyebrow>
              <h2 className="mt-4 font-display text-xl font-bold tracking-tight text-foreground">
                Atendemos Quito y provincias cercanas
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Coordinamos entregas periódicas para que su negocio mantenga su
                stock de limpieza e higiene sin interrupciones.
              </p>
              <RevealGroup className="mt-6 flex flex-wrap gap-2" stagger={0.04}>
                {coverageSectors.map((sector) => (
                  <RevealItem key={sector} distance={10}>
                    <Badge variant="outline" className="gap-1.5">
                      <MapPin className="h-3 w-3 text-ring" aria-hidden="true" />
                      {sector}
                    </Badge>
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          </Card>
          </RevealItem>
        </RevealGroup>

        <Reveal delay={0.08}>
        <Card className="mt-6 overflow-hidden">
          <iframe
            title="Ubicación referencial de LABMAREMI en Quito"
            src={OFFICE_MAP_SRC}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
            className="h-[320px] w-full border-0 md:h-[420px]"
          />
          <div className="flex flex-col gap-4 border-t p-5 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              ¿Ya sabe qué productos necesita?
            </p>
            <InteractiveHoverLink
              to="/cotizacion"
              text="Solicitar cotización"
              variant="outline"
              className="w-full md:w-auto"
            />
          </div>
        </Card>
        </Reveal>
      </Section>
    </>
  )
}
