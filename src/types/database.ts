/**
 * Hand-written database types matching supabase/migrations/0001_phase2_foundation.sql.
 * Shape follows the supabase-js contract: Database['public']['Tables'][T]['Row' | 'Insert' | 'Update'].
 *
 * NOTE: DB columns are snake_case; the app's existing interfaces in src/types
 * are camelCase. Mapping between the two happens in P5, not here.
 */

export type QuoteStatus =
  | "nuevo"
  | "contactado"
  | "interesado"
  | "cliente"
  | "rechazado"

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      business_types: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          name: string
          category_id: string
          description: string
          presentation: string
          recommended_use: string
          image_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category_id: string
          description?: string
          presentation?: string
          recommended_use?: string
          image_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category_id?: string
          description?: string
          presentation?: string
          recommended_use?: string
          image_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          id: string
          company_name: string
          contact_person: string
          phone: string
          email: string
          business_type_id: string | null
          location: string
          message: string
          status: QuoteStatus
          created_at: string
        }
        Insert: {
          id?: string
          company_name: string
          contact_person: string
          phone?: string
          email?: string
          business_type_id?: string | null
          location?: string
          message?: string
          status?: QuoteStatus
          created_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          contact_person?: string
          phone?: string
          email?: string
          business_type_id?: string | null
          location?: string
          message?: string
          status?: QuoteStatus
          created_at?: string
        }
        Relationships: []
      }
      quote_request_items: {
        Row: {
          id: string
          quote_request_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          quote_request_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          quote_request_id?: string
          product_id?: string
          created_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          id: string
          company_name: string
          contact_person: string
          phone: string
          email: string
          notes: string
          created_at: string
        }
        Insert: {
          id?: string
          company_name: string
          contact_person: string
          phone?: string
          email?: string
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          contact_person?: string
          phone?: string
          email?: string
          notes?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      quote_status: QuoteStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
