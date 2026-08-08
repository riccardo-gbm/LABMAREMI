import { useEffect } from "react"

export interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>
  id?: string
}

export function JsonLd({ data, id = "json-ld-schema" }: JsonLdProps) {
  useEffect(() => {
    let script = document.getElementById(id) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement("script")
      script.id = id
      script.type = "application/ld+json"
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(data)

    return () => {
      const el = document.getElementById(id)
      if (el) {
        el.remove()
      }
    }
  }, [data, id])

  return null
}
