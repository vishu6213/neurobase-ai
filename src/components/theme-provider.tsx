"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // We wrap it and ensure we don't pass any problematic props that might trigger script injection issues in React 19
  return (
    <NextThemesProvider 
      {...props} 
      enableSystem={false} 
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
