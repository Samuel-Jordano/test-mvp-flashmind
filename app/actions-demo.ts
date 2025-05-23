"use server"

import type { Flashcard } from "@/types/flashcard"

// Esta função é usada quando a API key não está configurada
// Ela gera flashcards localmente sem chamar a API
export async function generateDemoFlashcards(summary: string, count: number): Promise<Flashcard[]> {
  console.log("Usando modo de demonstração aprimorado para gerar flashcards localmente...")

  // Simular um atraso para parecer que está processando
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const flashcards: Flashcard[] = []

  // Adicionar um flashcard especial para indicar que estamos no modo de demonstração
  if (count > 0) {
    flashcards.push({
      question: "[Modo de Demonstração] Como funciona este modo?",
      answer:
        "Este é o modo de demonstração. Como a chave da API de IA não foi configurada, os flashcards são gerados localmente com base no conteúdo do seu resumo, mas sem o uso de inteligência artificial avançada. A qualidade pode variar.",
    })
  }

  // Tentar gerar os flashcards restantes
  const remainingCount = count - flashcards.length
  if (remainingCount <= 0) {
    return flashcards
  }

  const contentUnits = summary
    .split(/\n\n+|\.\s+|\n/)
    .map((unit) => unit.trim())
    .filter((unit) => unit.length > 20) // Filtrar unidades muito curtas

  if (contentUnits.length === 0) {
    if (summary.trim().length > 0 && remainingCount > 0) {
        flashcards.push({
            question: "Qual é a ideia principal do resumo fornecido?",
            answer: summary.trim().substring(0, 250) + (summary.trim().length > 250 ? "..." : "")
        });
    }
    return flashcards.slice(0, count); // Garantir que não exceda a contagem
  }

  for (let i = 0; i < Math.min(remainingCount, contentUnits.length); i++) {
    const unit = contentUnits[i]
    let question = ""
    let answer = unit

    // Tentar criar perguntas mais variadas
    const firstSentence = unit.split(".")[0]
    const words = firstSentence.replace(/[^a-zA-Z0-9\s]/g, "").split(" ").filter(w => w.length > 3);
    const commonStarters = ["Explique sobre", "Detalhe o conceito de", "Qual a importância de", "Como funciona"];
    
    let keyTerm = words.length > 2 ? words.slice(0, 3).join(" ") : firstSentence.substring(0, 30);
    if (keyTerm.length > 40) keyTerm = keyTerm.substring(0, 40) + "...";

    if (i % 4 === 0) {
      question = `O que pode ser dito sobre "${keyTerm}"?`
    } else if (i % 4 === 1) {
      question = `Descreva o principal ponto relacionado a "${keyTerm}".`
    } else if (i % 4 === 2) {
        const randomStarter = commonStarters[Math.floor(Math.random() * commonStarters.length)];
        question = `${randomStarter} "${keyTerm}"?`
    } else {
      question = `Resuma a informação sobre "${keyTerm}".`
    }

    // Limitar o tamanho da resposta para melhor visualização no card
    if (answer.length > 300) {
      answer = answer.substring(0, 297) + "..."
    }

    flashcards.push({ question, answer })
  }

  return flashcards.slice(0, count); // Garantir que não exceda a contagem total
}

