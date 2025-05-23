"use server"

import type { Flashcard } from "@/types/flashcard"
import { generateDemoFlashcards } from "./actions-demo"

export async function generateFlashcardsAction(summary: string, count: number): Promise<Flashcard[]> {
  // Verificar se a chave de API está configurada
  const apiKey = process.env.AGENT_FLASHMIND

  console.log("Verificando API key:", apiKey ? "API key configurada" : "API key não encontrada")

  // Se a API key não estiver configurada, usar o modo de demonstração
  if (!apiKey) {
    console.log("AGENT_FLASHMIND não está configurada, usando modo de demonstração")
    return generateDemoFlashcards(summary, count)
  }

  try {
    console.log(`Gerando ${count} flashcards com o modelo Gemini 2.0 Flash`)

    // Prompt melhorado para enfatizar a necessidade de respostas específicas
    const prompt = `
    Você é um assistente especializado na criação de flashcards educacionais de alta qualidade, baseados em resumos de estudo.

    Sua tarefa é gerar exatamente ${count} flashcards no formato JSON, com base no resumo fornecido abaixo.

    ### INSTRUÇÕES OBRIGATÓRIAS:

    1. Gere exatamente ${count} flashcards. Nem mais, nem menos.
    2. Cada flashcard deve conter:
   - Uma **pergunta clara e objetiva**, que trate de um conceito importante do resumo.
   - Uma **resposta curta, direta e assertiva**, contendo apenas o essencial para entender o conceito.
    3. As respostas devem ser **focadas**, com no máximo 2 a 3 frases. Sem enrolação.
    4. Use **somente informações do resumo**. Não invente ou adicione nada externo.
    5. As perguntas devem abranger os **principais pontos e ideias centrais** do conteúdo.
    6. NÃO escreva respostas genéricas como "Consulte o resumo" ou "Revise o conteúdo".
    7. O conteúdo deve ser **didático e útil para revisão rápida de estudos**.

    ---

    ### RESUMO:
    ${summary}

    ---

    ### FORMATO DA RESPOSTA:

    Responda APENAS com um array JSON válido, no seguinte formato:

    [
      {
        "question": "Pergunta clara sobre um conceito do resumo?",
        "answer": "Resposta curta e objetiva, com as informações essenciais do resumo."
      },
      {
        "question": "Outra pergunta importante?",
        "answer": "Resposta igualmente curta, mas precisa e baseada no resumo."
      }
    ]

  `

    console.log("Enviando requisição para Google Gemini API...")

    // Usando a API do Google Gemini com o modelo Gemini 2.0 Flash
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
      },
    )

    console.log("Status da resposta:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Resposta de erro completa:", errorText)

      try {
        const errorData = JSON.parse(errorText)
        throw new Error(`Erro na API Gemini: ${JSON.stringify(errorData)}`)
      } catch (e) {
        throw new Error(`Erro na API Gemini: Status ${response.status}`)
      }
    }

    const data = await response.json()
    console.log("Resposta da API parseada:", JSON.stringify(data))

    // Extrair o texto da resposta com base na estrutura da API Gemini
    let extractedText = ""

    // Tentar extrair o texto da estrutura da API Gemini
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      const parts = data.candidates[0].content.parts
      for (const part of parts) {
        if (part.text) {
          extractedText += part.text
        }
      }
    }

    console.log("Texto extraído da resposta:", extractedText)

    // Tentativa de extrair JSON da resposta
    try {
      // Primeiro, tentamos encontrar um array JSON na resposta
      const jsonMatch = extractedText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        console.log("JSON encontrado via regex:", jsonMatch[0])
        const flashcards: Flashcard[] = JSON.parse(jsonMatch[0])
        return flashcards.slice(0, count)
      }

      // Se não encontrarmos um array JSON via regex, tentamos analisar o texto completo como JSON
      try {
        const parsedData = JSON.parse(extractedText)
        if (Array.isArray(parsedData)) {
          console.log("Texto completo parseado como array JSON")
          return parsedData.slice(0, count)
        } else if (parsedData.flashcards && Array.isArray(parsedData.flashcards)) {
          console.log("Encontrado array de flashcards dentro do objeto JSON")
          return parsedData.flashcards.slice(0, count)
        }
      } catch (e) {
        console.log("Não foi possível parsear o texto completo como JSON:", e.message)
      }

      // Se não conseguimos extrair um JSON válido, vamos criar flashcards manualmente
      // baseados no conteúdo do resumo
      return createFlashcardsFromSummary(summary, count)
    } catch (parseError) {
      console.error("Erro ao processar resposta:", parseError)
      console.error("Texto recebido:", extractedText)

      // Fallback: criar flashcards baseados no resumo
      return createFlashcardsFromSummary(summary, count)
    }
  } catch (error) {
    console.error("Erro ao gerar flashcards:", error)
    // Em caso de erro, usar o modo de demonstração
    console.log("Usando modo de demonstração devido a erro na API")
    return generateDemoFlashcards(summary, count)
  }
}

// Função para criar flashcards a partir do resumo quando a API falha
function createFlashcardsFromSummary(summary: string, count: number): Flashcard[] {
  console.log("Criando flashcards manualmente a partir do resumo...")

  // Dividir o resumo em parágrafos
  const paragraphs = summary.split("\n").filter((p) => p.trim().length > 0)

  if (paragraphs.length === 0) {
    // Se não houver parágrafos, dividir por pontos
    const sentences = summary.split(".").filter((s) => s.trim().length > 0)

    if (sentences.length > 0) {
      return sentences.slice(0, Math.min(count, sentences.length)).map((sentence, index) => {
        // Extrair palavras-chave da sentença
        const words = sentence.trim().split(" ")
        const keyTerms = words.filter((word) => word.length > 4).slice(0, 2)

        if (keyTerms.length > 0) {
          const keyTerm = keyTerms[0]
          return {
            question: `O que é ${keyTerm} e qual sua importância?`,
            answer: `${sentence.trim()}. Este é um conceito importante mencionado no resumo.`,
          }
        } else {
          return {
            question: `Explique o seguinte conceito: "${sentence.substring(0, 30)}..."`,
            answer: sentence.trim(),
          }
        }
      })
    }
  }

  // Criar flashcards a partir dos parágrafos
  return paragraphs.slice(0, Math.min(count, paragraphs.length)).map((paragraph, index) => {
    // Identificar possíveis termos-chave (palavras mais longas)
    const words = paragraph.split(" ")
    const longWords = words.filter((word) => word.length > 5)

    // Selecionar um termo-chave ou usar o início do parágrafo
    const keyTerm =
      longWords.length > 0 ? longWords[Math.floor(Math.random() * longWords.length)] : words.slice(0, 3).join(" ")

    // Criar perguntas baseadas no conteúdo do parágrafo
    if (index % 3 === 0) {
      return {
        question: `O que é ${keyTerm} e como se define?`,
        answer: paragraph.trim(),
      }
    } else if (index % 3 === 1) {
      return {
        question: `Explique o conceito de ${keyTerm} mencionado no resumo:`,
        answer: paragraph.trim(),
      }
    } else {
      return {
        question: `Quais são as características principais de ${keyTerm}?`,
        answer: paragraph.trim(),
      }
    }
  })
}
