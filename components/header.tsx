"use client"

import { MoonIcon, SunIcon, BookOpen, Sparkles } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export default function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="py-4 bg-background/80 border-b border-primary/10 sticky top-0 z-10 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="relative">
              <BookOpen size={24} className="text-primary" />
              <Sparkles size={12} className="text-primary absolute -top-1 -right-1" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">FlashMind</h2>
              <p className="text-xs text-muted-foreground">Cartões rápidos para memorização</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? "Modo claro" : "Modo escuro"}
            className="rounded-full hover:bg-primary/10"
          >
            {theme === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </Button>
        </div>
      </div>
    </header>
  )
}
