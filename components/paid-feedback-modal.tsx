"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { MessageSquareHeart, CreditCard } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface PaidFeedbackModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export default function PaidFeedbackModal({ isOpen, onOpenChange }: PaidFeedbackModalProps) {
  const [feedbackText, setFeedbackText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      toast({
        title: "Feedback Vazio",
        description: "Por favor, escreva seu feedback antes de enviar.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    // Simular chamada de API e pagamento
    await new Promise(resolve => setTimeout(resolve, 1500))

    console.log("Feedback Pago Enviado (Simulado):", feedbackText)
    // Aqui, em um app real, você enviaria o feedback para o backend e processaria o pagamento.

    toast({
      title: "Feedback Enviado!",
      description: "Obrigado por seu feedback e apoio! (Simulação)",
      variant: "success",
    })

    setFeedbackText("")
    setIsSubmitting(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <MessageSquareHeart className="h-6 w-6 text-primary" />
            <DialogTitle className="text-xl font-semibold text-primary">Apoie com Feedback</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Agradecemos seu apoio! Envie-nos seu feedback valioso por uma pequena contribuição de R$ 5,00 (simulado).
            Isso nos ajuda a manter e melhorar o FlashMind.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <textarea
            placeholder="Digite seu feedback aqui... (mínimo 10 caracteres)"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="min-h-[120px] text-sm rounded-md border-primary/20 focus:ring-primary/30 w-full p-3 border"
            disabled={isSubmitting}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting} className="rounded-full">
              Cancelar
            </Button>
          </DialogClose>
          <Button 
            onClick={handleSubmitFeedback} 
            disabled={isSubmitting || feedbackText.trim().length < 10}
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSubmitting ? (
              <>
                <CreditCard className="mr-2 h-4 w-4 animate-pulse" />
                Processando Pagamento...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pagar R$ 5,00 e Enviar (Simulado)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
