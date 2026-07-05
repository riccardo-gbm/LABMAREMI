import { useParams } from "react-router-dom"

import { PageHeader } from "@/components/ui/page-header"

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <PageHeader
      title="Detalle de producto"
      description={`Producto: ${id ?? "—"}. Contenido en construcción (Fase 1).`}
    />
  )
}
