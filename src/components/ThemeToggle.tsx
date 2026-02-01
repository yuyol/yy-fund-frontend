import { useState, useRef, useEffect } from "react"
import { Moon, Sun, Monitor, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/ThemeProvider"
import { cn } from "@/lib/utils"

type Theme = "light" | "dark" | "system"

const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "浅色模式", icon: <Sun className="size-4" /> },
  { value: "dark", label: "深色模式", icon: <Moon className="size-4" /> },
  { value: "system", label: "跟随系统", icon: <Monitor className="size-4" /> },
]

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // ESC 键关闭
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [])

  const getCurrentIcon = () => {
    if (theme === "system") {
      return <Monitor className="size-4" />
    }
    if (resolvedTheme === "dark") {
      return <Moon className="size-4" />
    }
    return <Sun className="size-4" />
  }

  const handleSelect = (value: Theme) => {
    setTheme(value)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-1.5"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {getCurrentIcon()}
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </Button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1.5 w-36 rounded-md border border-border bg-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
          role="listbox"
          aria-label="选择主题"
        >
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={cn(
                "flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                theme === option.value &&
                  "bg-accent/50 text-accent-foreground font-medium"
              )}
              role="option"
              aria-selected={theme === option.value}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
