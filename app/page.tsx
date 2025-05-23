"use client"

import { useState, useEffect, useRef } from "react"
import { generateFlashcardsAction } from "./actions"
import type { Flashcard } from "@/types/flashcard"
import ChatInput from "@/components/chat-input"
import FlashcardDisplay from "@/components/flashcard-display"
import Header from "@/components/header"
import PaidFeedbackModal from "@/components/paid-feedback-modal"
import LimitReachedModal from "@/components/limit-reached-modal"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, BookOpen, Info, Sparkles, MessageSquareHeart, Gift } from "lucide-react"

const INITIAL_FREE_LIMIT = 5; // Limite inicial de cliques gratuitos
const ADDITIONAL_CLICKS_PACKAGE = 5; // Pacote adicional de cliques
const PAYMENT_LINK = "https://buy.stripe.com/9B67sMc31cv60U63Ax5kk01"; // Link de pagamento do Stripe

// Função para verificar cookies
const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [summary, setSummary] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const { toast } = useToast()

  // Estados para as novas funcionalidades de monetização
  const [isPaidFeedbackModalOpen, setIsPaidFeedbackModalOpen] = useState(false)
  const [isLimitReachedModalOpen, setIsLimitReachedModalOpen] = useState(false)
  
  // Novo estado para rastrear cliques no botão de geração
  const [remainingClicks, setRemainingClicks] = useState(INITIAL_FREE_LIMIT)
  const [totalClicksAvailable, setTotalClicksAvailable] = useState(INITIAL_FREE_LIMIT)
  const [usedClicks, setUsedClicks] = useState(0)
  const [hasUsedApp, setHasUsedApp] = useState(false)

  // Referência para o botão do Stripe na página principal
  const stripeButtonRef = useRef<HTMLDivElement>(null);

  // Carregar estado de cliques e verificar proteção contra reset
  useEffect(() => {
    // Verificar primeiro os cookies (mais difíceis de limpar)
    const cookieHasUsedApp = getCookie("hasUsedApp");
    const cookieRemainingClicks = getCookie("remainingClicks");
    
    // Verificar localStorage
    const storedRemainingClicks = localStorage.getItem("remainingClicks");
    const storedTotalClicks = localStorage.getItem("totalClicksAvailable");
    const storedUsedClicks = localStorage.getItem("usedClicks");
    const storedHasUsedApp = localStorage.getItem("hasUsedApp");
    
    // Verificar se o usuário já usou o app antes (usando cookies ou localStorage)
    if (cookieHasUsedApp === "true" || storedHasUsedApp === "true") {
      setHasUsedApp(true);
      
      // Se já usou o app, verificar se há tentativa de reset
      const isResetAttempt = cookieHasUsedApp === "true" && !storedHasUsedApp;
      
      if (isResetAttempt) {
        // Usuário limpou localStorage mas não cookies - possível tentativa de reset
        if (cookieRemainingClicks && parseInt(cookieRemainingClicks) <= 0) {
          // Se não tinha mais créditos, mantém em zero
          setRemainingClicks(0);
          setTotalClicksAvailable(parseInt(cookieRemainingClicks) || 0);
          toast({
            title: "Limite de Geração",
            description: "Você já utilizou todos os seus créditos gratuitos. Adquira mais créditos para continuar.",
            variant: "warning",
          });
        } else {
          // Restaura do cookie
          setRemainingClicks(parseInt(cookieRemainingClicks || "0"));
          setTotalClicksAvailable(parseInt(cookieRemainingClicks || "0"));
        }
      } else {
        // Carrega normalmente do localStorage
        if (storedRemainingClicks) {
          setRemainingClicks(parseInt(storedRemainingClicks));
        }
        
        if (storedTotalClicks) {
          setTotalClicksAvailable(parseInt(storedTotalClicks));
        }
        
        if (storedUsedClicks) {
          setUsedClicks(parseInt(storedUsedClicks));
        }
      }
    } else {
      // Primeira vez usando o app, define valores iniciais
      setRemainingClicks(INITIAL_FREE_LIMIT);
      setTotalClicksAvailable(INITIAL_FREE_LIMIT);
      setUsedClicks(0);
    }
  }, [toast]);

  // Salvar estado de cliques no localStorage e cookies quando mudar
  useEffect(() => {
    // Salvar no localStorage
    localStorage.setItem("remainingClicks", remainingClicks.toString());
    localStorage.setItem("totalClicksAvailable", totalClicksAvailable.toString());
    localStorage.setItem("usedClicks", usedClicks.toString());
    localStorage.setItem("hasUsedApp", hasUsedApp.toString());
    
    // Salvar também em cookies para proteção adicional
    const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `hasUsedApp=${hasUsedApp}; expires=${expiryDate}; path=/; SameSite=Strict`;
    document.cookie = `remainingClicks=${remainingClicks}; expires=${expiryDate}; path=/; SameSite=Strict`;
    document.cookie = `totalClicksAvailable=${totalClicksAvailable}; expires=${expiryDate}; path=/; SameSite=Strict`;
    document.cookie = `usedClicks=${usedClicks}; expires=${expiryDate}; path=/; SameSite=Strict`;
  }, [remainingClicks, totalClicksAvailable, usedClicks, hasUsedApp]);

  // Efeito para carregar o widget do Buy Me a Coffee
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js";
    script.setAttribute("data-name", "bmc-button");
    script.setAttribute("data-slug", "veltgroup");
    script.setAttribute("data-color", "#FFDD00");
    script.setAttribute("data-emoji", "");
    script.setAttribute("data-font", "Cookie");
    script.setAttribute("data-text", "Buy me a coffee");
    script.setAttribute("data-outline-color", "#000000");
    script.setAttribute("data-font-color", "#000000");
    script.setAttribute("data-coffee-color", "#ffffff");
    script.async = true;

    const container = document.getElementById("buy-me-a-coffee-widget-container");
    if (container) {
      // Limpa o container antes de adicionar o script para evitar duplicatas em HMR
      container.innerHTML = "";
      container.appendChild(script);
    }

    // Função de limpeza para remover o script quando o componente desmontar
    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, []);

  // Efeito para carregar o botão do Stripe na página principal quando necessário
  useEffect(() => {
    if (remainingClicks <= 0 && stripeButtonRef.current) {
      // Verificar se o botão já foi carregado
      if (stripeButtonRef.current.querySelector('stripe-buy-button')) {
        return;
      }

      // Criar o elemento do botão do Stripe
      const stripeButton = document.createElement('stripe-buy-button');
      stripeButton.setAttribute('buy-button-id', 'buy_btn_1RRy6aK5ZpNGmmicXT9jtFi8');
      stripeButton.setAttribute('publishable-key', 'pk_live_51RQTjMK5ZpNGmmickXiALhyngM9igFUNCMV8VDYy5D75U1fxlWjYx0ip4IkF2vD52LckuAt0CCZVSORz8EEwwi6T00qh3ny6xs');
      
      // Limpar o container e adicionar o botão
      stripeButtonRef.current.innerHTML = '';
      stripeButtonRef.current.appendChild(stripeButton);
    }
  }, [remainingClicks]);

  const handleSummarySubmit = async (text: string, count: number) => {
    if (!text.trim()) {
      toast({
        title: "Resumo vazio",
        description: "Por favor, insira um resumo para gerar flashcards.",
        variant: "destructive",
      })
      return
    }

    // Marcar que o usuário já usou o app
    if (!hasUsedApp) {
      setHasUsedApp(true);
    }

    // Verificar limite de cliques de geração
    if (remainingClicks <= 0) {
      setIsLimitReachedModalOpen(true)
      toast({
        title: "Limite de Geração Atingido",
        description: "Você atingiu o limite de cliques no botão de geração. Adquira mais cliques para continuar.",
        variant: "warning",
      })
      return
    }

    // Decrementar o contador de cliques restantes
    setRemainingClicks(prev => prev - 1);
    setUsedClicks(prev => prev + 1);
    
    setSummary(text)
    setIsLoading(true)
    setError(null)
    setIsDemoMode(false)

    try {
      const generatedFlashcards = await generateFlashcardsAction(text, count)
      if (generatedFlashcards.length > 0 && generatedFlashcards[0].question.includes("modo de demonstração")) {
        setIsDemoMode(true)
      } else if (generatedFlashcards.length > 0 && !generatedFlashcards[0].question.includes("API key não configurada")) {
        setIsDemoMode(false);
      }
      
      setFlashcards(generatedFlashcards)

    } catch (error) {
      console.error("Erro ao gerar flashcards:", error)
      setError(error instanceof Error ? error.message : "Erro desconhecido ao gerar flashcards")
      toast({
        title: "Erro ao Gerar Flashcards",
        description: "Ocorreu um erro. Tente novamente ou verifique o console para detalhes.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFlashcardUpdate = (updatedFlashcards: Flashcard[]) => {
    setFlashcards(updatedFlashcards)
  }

  const handleClearFlashcards = () => {
    setFlashcards([])
    setSummary("")
  }

  const handleBuyMoreClicks = () => {
    // Abre o modal que conterá o botão para o link de pagamento
    setIsLimitReachedModalOpen(true);
  }

  // Efeito para verificar se a API key está configurada no início
  useEffect(() => {
    async function checkApiKey() {
      try {
        const testFlashcards = await generateFlashcardsAction("Teste de API", 1);
        if (testFlashcards.length > 0 && testFlashcards[0].question.includes("API key não está configurada")) {
          setIsDemoMode(true);
          toast({
            title: "Modo de demonstração (API)",
            description: "A API key do Google Gemini não está configurada. Usando geração local de flashcards.",
            variant: "default",
          });
        }
      } catch (e) {
        console.warn("Falha ao verificar API key, ativando modo de demonstração:", e);
        setIsDemoMode(true);
        toast({
          title: "Modo de demonstração (Erro API)",
          description: "Não foi possível conectar à API de IA. Usando geração local de flashcards.",
          variant: "default",
        });
      }
    }
    checkApiKey();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8 sm:py-10 px-4 sm:px-6 mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 sm:gap-10">
          <div className="text-center mb-2 sm:mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BookOpen size={28} className="text-primary" />
              <Sparkles size={14} className="text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 text-primary">FlashMind</h1>
            <div className="flex items-center justify-center gap-2 text-lg sm:text-xl text-muted-foreground">
              <p>Transforme seus resumos em cartões de memorização</p>
            </div>
          </div>

          {/* Seção de Monetização */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 p-4 border border-dashed border-primary/30 rounded-xl bg-card/50">
            <div className="text-center sm:text-left">
                <p className="text-sm font-medium text-primary">
                    Cliques de geração restantes: {remainingClicks} / {totalClicksAvailable}
                </p>
                <p className="text-xs text-muted-foreground">
                    Cada clique no botão "Gerar Flashcards" consome 1 crédito.
                </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center items-center">
              {/* Container para o widget Buy Me a Coffee */}
              <div id="buy-me-a-coffee-widget-container" className="h-[50px]"></div>
              <Button onClick={() => setIsPaidFeedbackModalOpen(true)} variant="outline" className="rounded-full border-primary/50 hover:bg-primary/10">
                <MessageSquareHeart size={16} className="mr-2 text-primary" /> Apoie com Feedback
              </Button>
              {remainingClicks <= 0 && (
                <div 
                  ref={stripeButtonRef} 
                  className="stripe-button-container"
                  style={{
                    minHeight: '40px',
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                ></div>
              )}
            </div>
          </div>

          {isDemoMode && (
            <Alert
              variant="default"
              className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 rounded-xl"
            >
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-800 dark:text-blue-300">Modo de Demonstração Ativo</AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-400">
                A aplicação está rodando em modo de demonstração porque a API key não está configurada ou ocorreu um erro. Os flashcards estão sendo gerados localmente sem IA avançada.
              </AlertDescription>
            </Alert>
          )}

          <ChatInput onSubmit={handleSummarySubmit} isLoading={isLoading} />

          {error && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {flashcards.length > 0 && (
            <FlashcardDisplay
              flashcards={flashcards}
              onUpdate={handleFlashcardUpdate}
              onClear={handleClearFlashcards}
              summary={summary}
            />
          )}
        </div>
      </div>

      {/* Modais de Monetização */}
      <PaidFeedbackModal isOpen={isPaidFeedbackModalOpen} onOpenChange={setIsPaidFeedbackModalOpen} />
      <LimitReachedModal 
        isOpen={isLimitReachedModalOpen} 
        onOpenChange={setIsLimitReachedModalOpen} 
        paymentLink={PAYMENT_LINK} // Passa o link do Stripe
        limit={totalClicksAvailable}
        isClickLimit={true}
      />

      {/* Elementos decorativos de fundo */}
      <div className="fixed top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="fixed bottom-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
    </div>
  )
}
