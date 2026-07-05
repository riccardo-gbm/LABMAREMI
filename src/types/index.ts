export interface Category {
  id: string
  name: string
  description: string
}

export interface Product {
  id: string
  name: string
  categoryId: string
  description: string
  presentation: string
  recommendedUse: string
}

export interface BusinessType {
  id: string
  name: string
  description: string
}

export type LeadStatus =
  | "Nuevo"
  | "Contactado"
  | "Interesado"
  | "Cliente"
  | "Rechazado"

export interface Lead {
  id: string
  companyName: string
  contactPerson: string
  phone: string
  email: string
  businessTypeId: string
  location: string
  productsOfInterest: string[]
  message: string
  status: LeadStatus
  createdAt: string
}

export interface QuoteRequest {
  companyName: string
  contactPerson: string
  phone: string
  email: string
  businessTypeId: string
  location: string
  productsOfInterest: string[]
  message: string
}
