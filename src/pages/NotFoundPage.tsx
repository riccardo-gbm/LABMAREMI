import { Link } from "react-router-dom"

import { PageHeader } from "@/components/ui/page-header"
import { Section } from "@/components/ui/section"
import { buttonVariants } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <>
      <PageHeader
        title="Página no encontrada"
        description="La página que busca no existe o fue movida."
      />
      <Section>
        <Link to="/" className={buttonVariants()}>
          Volver al inicio
        </Link>
      </Section>
    </>
  )
}
