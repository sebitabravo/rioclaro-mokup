import React, { useEffect, useState } from 'react'
import { Theme } from './ThemeContextTypes'
import { ThemeContext } from './ThemeContextProvider'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'system'
    }
    return 'system'
  })
  
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })

  const effectiveTheme = theme === 'system' ? systemTheme : theme

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', theme)
    
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    
    if (effectiveTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.add('light')
    }
  }, [theme, effectiveTheme])

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      systemTheme,
      effectiveTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

// useTheme hook is available from './theme-hook' if needed separately
// Theme types are available from './ThemeContextTypes'
// ThemeContext is available from './ThemeContextProvider'