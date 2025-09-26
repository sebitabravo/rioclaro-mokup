import { Moon, Sun, Monitor } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/components/ui/dropdown-menu'
import { useTheme } from '@shared/contexts/theme-hook'
import { cn } from '@shared/utils/cn'

const themes = [
  {
    name: 'Claro',
    value: 'light' as const,
    icon: Sun,
  },
  {
    name: 'Oscuro', 
    value: 'dark' as const,
    icon: Moon,
  },
  {
    name: 'Sistema',
    value: 'system' as const,
    icon: Monitor,
  },
]

export function ThemeToggle() {
  const themeContext = useTheme()
  if (!themeContext) return null
  const { theme, setTheme, effectiveTheme } = themeContext

  const currentTheme = themes.find(t => t.value === theme) || themes[2]
  const CurrentIcon = currentTheme.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-9 w-9 px-0 hover:bg-accent/50 dark:hover:bg-accent/50"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={effectiveTheme}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 10
              }}
            >
              <CurrentIcon className="h-4 w-4" />
            </motion.div>
          </AnimatePresence>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon
          const isSelected = theme === themeOption.value
          
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                isSelected && "bg-accent"
              )}
            >
              <motion.div
                initial={false}
                animate={{ scale: isSelected ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Icon className="h-4 w-4" />
              </motion.div>
              {themeOption.name}
              {isSelected && (
                <motion.div
                  layoutId="theme-indicator"
                  className="ml-auto w-2 h-2 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}