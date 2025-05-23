"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { PackagePlus, AlertTriangle, ExternalLink } from "lucide-react"

interface LimitReachedModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  paymentLink: string // URL do link de pagamento
  limit: number
  isClickLimit?: boolean
}

export default function LimitReachedModal({ 
  isOpen, 
  onOpenChange, 
  paymentLink,
  limit,
  isClickLimit = false 
}: LimitReachedModalProps) {
  const stripeButtonRef = useRef<HTMLDivElement>(null);
  const [stripeButtonLoaded, setStripeButtonLoaded] = useState(false);

  // Função para verificar se o botão do Stripe foi carregado
  useEffect(() => {
    if (isOpen && stripeButtonRef.current) {
      // Verificar se o botão já foi carregado
      if (stripeButtonRef.current.querySelector('stripe-buy-button')) {
        setStripeButtonLoaded(true);
        return;
      }

      // Criar o elemento do botão do Stripe
      const stripeButton = document.createElement('stripe-buy-button');
      stripeButton.setAttribute('buy-button-id', 'buy_btn_1RRy6aK5ZpNGmmicXT9jtFi8');
      stripeButton.setAttribute('publishable-key', 'pk_live_51RQTjMK5ZpNGmmickXiALhyngM9igFUNCMV8VDYy5D75U1fxlWjYx0ip4IkF2vD52LckuAt0CCZVSORz8EEwwi6T00qh3ny6xs');
      
      // Limpar o container e adicionar o botão
      if (stripeButtonRef.current) {
        stripeButtonRef.current.innerHTML = '';
        stripeButtonRef.current.appendChild(stripeButton);
        setStripeButtonLoaded(true);
      }
    }
  }, [isOpen]);

  // Função de fallback para redirecionamento direto
  const handleRedirectToPayment = () => {
    if (paymentLink && paymentLink !== "#") {
      window.open(paymentLink, "_blank");
      onOpenChange(false); // Fecha o modal após redirecionar
    } else {
      // Poderia adicionar um toast aqui informando que o link não está configurado
      console.warn("Link de pagamento não configurado.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <DialogTitle className="text-xl font-semibold text-destructive">Limite Atingido!</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            {isClickLimit 
              ? `Você atingiu o limite de ${limit} cliques de geração para a versão gratuita.`
              : `Você atingiu o limite de ${limit} flashcards para a versão gratuita.`
            }
            Para continuar, adquira um pacote adicional.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 text-center">
          <p className="text-lg font-medium text-foreground">
            {isClickLimit 
              ? "Deseja continuar gerando flashcards?"
              : "Deseja criar mais flashcards?"
            }
          </p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            {isClickLimit 
              ? "Adquira um pacote de +5 cliques de geração por R$ 15,00."
              : "Adquira um pacote de +30 flashcards por R$ 15,00."
            }
          </p>
          
          {/* Container para o botão do Stripe */}
          <div 
            ref={stripeButtonRef} 
            className="stripe-button-container flex justify-center my-2"
            style={{
              minHeight: '40px',
              display: 'flex',
              justifyContent: 'center'
            }}
          ></div>
          
          {/* Mensagem de carregamento ou erro */}
          {!stripeButtonLoaded && (
            <p className="text-xs text-muted-foreground mt-1">
              Carregando opções de pagamento...
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" className="rounded-full">
              Cancelar
            </Button>
          </DialogClose>
          
          {/* Botão de fallback caso o Stripe não carregue */}
          {!stripeButtonLoaded && (
            <Button 
              onClick={handleRedirectToPayment} 
              disabled={!paymentLink || paymentLink === "#"} 
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {isClickLimit 
                ? "Comprar +5 Cliques"
                : "Comprar +30 Flashcards"
              }
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
