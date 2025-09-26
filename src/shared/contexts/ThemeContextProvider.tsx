import { createContext } from 'react'
import { ThemeContextType } from './ThemeContextTypes'

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)