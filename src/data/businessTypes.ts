import type { BusinessType } from "@/types"

export const businessTypes: BusinessType[] = [
  {
    id: "restaurantes",
    name: "Restaurantes",
    description:
      "Cocinas y comedores que requieren desengrasantes, desinfectantes y control higiénico constante.",
  },
  {
    id: "hoteles",
    name: "Hoteles",
    description:
      "Establecimientos de hospedaje con necesidades de insumos para habitaciones, baños y áreas comunes.",
  },
  {
    id: "oficinas",
    name: "Oficinas",
    description:
      "Espacios corporativos que buscan un abastecimiento confiable de limpieza e higiene para su personal.",
  },
  {
    id: "instituciones-educativas",
    name: "Instituciones Educativas",
    description:
      "Escuelas y colegios que necesitan insumos seguros para el aseo diario de aulas y baños.",
  },
  {
    id: "clinicas",
    name: "Clínicas",
    description:
      "Centros de salud con altos estándares de desinfección y bioseguridad para pacientes y personal.",
  },
  {
    id: "empresas-limpieza",
    name: "Empresas de Limpieza",
    description:
      "Compañías de servicios de limpieza que requieren abastecimiento al por mayor para sus operaciones.",
  },
  {
    id: "tiendas-locales",
    name: "Tiendas Locales",
    description:
      "Comercios y minimercados que buscan mantener sus locales limpios y presentables para sus clientes.",
  },
]
