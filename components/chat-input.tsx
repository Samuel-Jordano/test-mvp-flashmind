"use client"

import type React from "react"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Send, BookOpen, Hash, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ChatInputProps {
  onSubmit: (text: string, count: number) => void
  isLoading: boolean
}

export default function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [text, setText] = useState("")
  const [cardCount, setCardCount] = useState(4)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      onSubmit(text, cardCount)
    }
  }

  const handleCardCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value >= 1 && value <= 10) {
      setCardCount(value)
    }
  }

  return (
    <Card className="border-primary/10 shadow-lg hover-lift glass">
      <CardHeader className="pb-2 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="relative">
            <BookOpen size={18} className="text-primary" />
            <Sparkles size={10} className="text-primary absolute -top-1 -right-1" />
          </div>
          <CardTitle className="text-lg font-medium">Criar Flashcards</CardTitle>
        </div>
        <CardDescription className="text-sm">
          Insira seu resumo de estudo para gerar cartões de memorização com perguntas e respostas
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit}>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Digite seu resumo aqui... Ex: A fotossíntese é o processo pelo qual as plantas convertem luz solar em energia química..."
            rows={6}
            className="resize-y mb-4 focus:ring-primary/30 border-primary/10 rounded-xl"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Hash size={14} className="text-primary" />
                <Label htmlFor="card-count" className="text-sm text-muted-foreground">
                  Quantidade de Flashcards
                </Label>
              </div>
              <div className="flex items-center">
                <Input
                  id="card-count"
                  type="number"
                  min={1}
                  max={10}
                  value={cardCount}
                  onChange={handleCardCountChange}
                  className="w-full focus:ring-primary/30 border-primary/10 rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-full px-6 gap-2 shadow-sm hover:shadow-md transition-all w-full sm:w-auto pulse-on-hover"
            >
              {isLoading ? "Gerando cartões..." : "Gerar Flashcards"}
              <Send size={16} />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
