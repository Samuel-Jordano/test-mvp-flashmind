"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Check, Edit, RotateCw, CheckCircle2 } from "lucide-react"
import type { Flashcard } from "@/types/flashcard"

interface FlashcardItemProps {
  flashcard: Flashcard
  onUpdate: (flashcard: Flashcard) => void
  index: number
}

export default function FlashcardItem({ flashcard, onUpdate, index }: FlashcardItemProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedQuestion, setEditedQuestion] = useState(flashcard.question)
  const [editedAnswer, setEditedAnswer] = useState(flashcard.answer)
  const [isLearned, setIsLearned] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const answerTextRef = useRef<HTMLParagraphElement>(null)
  const questionTextRef = useRef<HTMLParagraphElement>(null)

  // Reset state when flashcard prop changes (e.g. when clearing and generating new ones)
  useEffect(() => {
    setIsFlipped(false);
    setIsEditing(false);
    setEditedQuestion(flashcard.question);
    setEditedAnswer(flashcard.answer);
    setIsLearned(false);
  }, [flashcard]);

  const handleFlip = () => {
    if (!isEditing) {
      setIsFlipped(!isFlipped)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    onUpdate({
      ...flashcard,
      question: editedQuestion,
      answer: editedAnswer,
    })
    setIsEditing(false)
  }

  const toggleLearned = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLearned(!isLearned)
  }

  return (
    <div
      ref={cardRef}
      className={`
        relative h-[280px] sm:h-[300px] rounded-xl border-2 
        ${isLearned ? "border-green-500/60 bg-green-500/5" : "border-primary/20 bg-card"}
        shadow-lg transition-all duration-500 transform-gpu hover-lift 
        ${isEditing ? "cursor-default" : "cursor-pointer hover:shadow-xl"}
        ${isFlipped ? "[transform:rotateY(180deg)]" : ""}
      `}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
      onClick={handleFlip}
    >
      {/* Frente do flashcard (pergunta) */}
      <div
        className={`
          absolute w-full h-full p-5 sm:p-6 flex flex-col justify-between
          rounded-xl backface-hidden
        `}
        style={{
          backfaceVisibility: "hidden",
          transform: "rotateY(0deg)",
        }}
      >
        <div className="flex-1 flex flex-col min-h-0"> {/* Added min-h-0 for flex child to shrink properly */}
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">Cartão #{index + 1}</p>
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleLearned}
              className={`h-7 w-7 p-0 rounded-full ${isLearned ? "text-green-600 hover:bg-green-500/10" : "text-muted-foreground hover:bg-primary/10"}`}
              aria-label={isLearned ? "Marcar como não aprendido" : "Marcar como aprendido"}
            >
              <CheckCircle2 size={18} />
            </Button>
          </div>

          <div className="flex-1 flex items-center justify-center overflow-hidden mb-2"> {/* Added overflow-hidden */}
            {isEditing ? (
              <Textarea
                value={editedQuestion}
                onChange={(e) => setEditedQuestion(e.target.value)}
                className="text-base resize-none h-full w-full focus:ring-primary/30 rounded-lg p-3 bg-background/30"
                onClick={(e) => e.stopPropagation()}
                placeholder="Digite a pergunta aqui..."
              />
            ) : (
              <p ref={questionTextRef} className="font-semibold text-base sm:text-lg text-center p-1 overflow-y-auto max-h-[150px] sm:max-h-[170px] w-full scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">{flashcard.question}</p>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-auto pt-3 border-t border-primary/10">
          <p className="text-xs sm:text-sm text-primary font-medium">Clique para ver a resposta</p>
          {isEditing ? (
            <Button
              size="icon"
              variant="default"
              onClick={(e) => {
                e.stopPropagation()
                handleSave()
              }}
              className="h-8 w-8 p-0 rounded-full bg-green-500 hover:bg-green-600"
              aria-label="Salvar edição"
            >
              <Check size={18} />
            </Button>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                handleEdit()
              }}
              className="h-8 w-8 p-0 rounded-full hover:bg-primary/10"
              aria-label="Editar flashcard"
            >
              <Edit size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Verso do flashcard (resposta) */}
      <div
        className="absolute w-full h-full p-5 sm:p-6 flex flex-col justify-between backface-hidden rounded-xl"
        style={{
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
        }}
      >
        <div className="flex-1 flex flex-col min-h-0"> {/* Added min-h-0 */}
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">Resposta</p>
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleLearned}
              className={`h-7 w-7 p-0 rounded-full ${isLearned ? "text-green-600 hover:bg-green-500/10" : "text-muted-foreground hover:bg-primary/10"}`}
              aria-label={isLearned ? "Marcar como não aprendido" : "Marcar como aprendido"}
            >
              <CheckCircle2 size={18} />
            </Button>
          </div>

          <div className="flex-1 flex items-center justify-center overflow-hidden mb-2"> {/* Added overflow-hidden */}
            {isEditing ? (
              <Textarea
                value={editedAnswer}
                onChange={(e) => setEditedAnswer(e.target.value)}
                className="text-sm sm:text-base resize-none h-full w-full focus:ring-primary/30 rounded-lg p-3 bg-background/30"
                onClick={(e) => e.stopPropagation()}
                placeholder="Digite a resposta aqui..."
              />
            ) : (
              <p ref={answerTextRef} className="text-sm sm:text-base text-center p-1 overflow-y-auto max-h-[150px] sm:max-h-[170px] w-full scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">{flashcard.answer}</p>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-auto pt-3 border-t border-primary/10">
          <p className="text-xs sm:text-sm text-primary font-medium">Clique para ver a pergunta</p>
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              setIsFlipped(!isFlipped)
            }}
            className="h-8 w-8 p-0 rounded-full hover:bg-primary/10"
            aria-label="Virar flashcard"
          >
            <RotateCw size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}

