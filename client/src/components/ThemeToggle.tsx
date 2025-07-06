import { useTheme } from "./ThemeProvider"
import { Sun, Moon, Monitor } from "react-feather"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun size={18} />
      case "dark":
        return <Moon size={18} />
      case "system":
        return <Monitor size={18} />
      default:
        return <Sun size={18} />
    }
  }

  const getTooltip = () => {
    switch (theme) {
      case "light":
        return "This feature is currently disabled"
      case "dark":
        return "Dark Mode"
      case "system":
        return "Adaptive"
      default:
        return "Toggle theme"
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors text-surface-600 hover:text-surface-900 dark:text-surface-300 dark:hover:text-surface-100"
      title={getTooltip()}
      aria-label={getTooltip()}
      disabled={true}
    >
      {getIcon()}
    </button>
  )
}
