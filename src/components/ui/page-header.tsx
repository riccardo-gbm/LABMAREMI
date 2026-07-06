import * as React from "react"

import { cn } from "@/lib/utils"

export interface PageHeaderProps extends React.HTMLAttributes<HTMLElement> {
  title: string
  description?: string
}

/**
 * Title band shown at the top of every internal page.
 * Children render below the description (breadcrumbs, actions, etc.).
 */
function PageHeader({
  title,
  description,
  className,
  children,
  ...props
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "border-b bg-secondary/40",
        className
      )}
      {...props}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </header>
  )
}

export { PageHeader }
