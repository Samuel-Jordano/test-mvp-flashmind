"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, BookOpen, Trash2, Sparkles } from "lucide-react"
import FlashcardItem from "./flashcard-item"
import type { Flashcard } from "@/types/flashcard"
import { useToast } from "@/components/ui/use-toast"

interface FlashcardDisplayProps {
  flashcards: Flashcard[]
  onUpdate: (flashcards: Flashcard[]) => void
  onClear: () => void
  summary: string
}

export default function FlashcardDisplay({ flashcards, onUpdate, onClear, summary }: FlashcardDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [title, setTitle] = useState("Cartões de Estudo")
  const { toast } = useToast()

  // Gerar um título baseado no resumo
  useEffect(() => {
    if (summary) {
      // Extrair as primeiras palavras do resumo para criar um título
      const words = summary.split(" ")
      const topicWords = words.slice(0, 5).join(" ")

      // Limitar o tamanho e adicionar reticências se necessário
      const shortTitle = topicWords.length > 30 ? topicWords.substring(0, 30) + "..." : topicWords

      setTitle(`Cartões de Estudo: ${shortTitle}`)
    }
  }, [summary])

  const handleUpdateFlashcard = (index: number, updatedFlashcard: Flashcard) => {
    const newFlashcards = [...flashcards]
    newFlashcards[index] = updatedFlashcard
    onUpdate(newFlashcards)
  }

  const handleClearFlashcards = () => {
    toast({
      title: "Flashcards removidos",
      description: "Todos os flashcards foram excluídos.",
    })
    onClear()
  }

  const nextFlashcard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const prevFlashcard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="relative">
            <BookOpen size={20} className="text-primary" />
            <Sparkles size={10} className="text-primary absolute -top-1 -right-1" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-primary">{title}</h2>
        </div>
        <Button
          onClick={handleClearFlashcards}
          variant="outline"
          size="sm"
          className="rounded-full text-destructive hover:bg-destructive/10 border-destructive/20"
        >
          <Trash2 size={16} className="mr-2" />
          Limpar Flashcards
        </Button>
      </div>

      <Card className="border-primary/10 shadow-lg glass">
        <CardHeader className="pb-2 px-4 sm:px-6">
          <CardTitle className="text-lg text-primary/80 font-medium">Flashcards ({flashcards.length})</CardTitle>
          <CardDescription>
            Clique nos cartões para ver as respostas. Marque como aprendido quando memorizar.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {/* Visualização mobile - um flashcard por vez */}
          <div className="block md:hidden">
            <FlashcardItem
              flashcard={flashcards[currentIndex]}
              onUpdate={(updatedFlashcard) => handleUpdateFlashcard(currentIndex, updatedFlashcard)}
              index={currentIndex}
            />
            <div className="flex justify-between mt-6 items-center">
              <Button
                onClick={prevFlashcard}
                variant="ghost"
                size="sm"
                disabled={currentIndex === 0}
                className="rounded-full"
              >
                <ChevronLeft size={16} className="mr-1" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground font-medium">
                {currentIndex + 1} de {flashcards.length}
              </span>
              <Button
                onClick={nextFlashcard}
                variant="ghost"
                size="sm"
                disabled={currentIndex === flashcards.length - 1}
                className="rounded-full"
              >
                Próximo
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>

          {/* Visualização desktop - grid de flashcards */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {flashcards.map((flashcard, index) => (
              <FlashcardItem
                key={index}
                flashcard={flashcard}
                onUpdate={(updatedFlashcard) => handleUpdateFlashcard(index, updatedFlashcard)}
                index={index}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
