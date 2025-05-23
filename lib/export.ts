import html2canvas from "html2canvas"

export async function exportAsImage(element: HTMLElement, fileName: string): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Melhor qualidade
      useCORS: true,
      backgroundColor: "#ffffff",
    })

    const image = canvas.toDataURL("image/png", 1.0)

    // Cria um link para download
    const link = document.createElement("a")
    link.download = `${fileName}.png`
    link.href = image
    link.click()
  } catch (error) {
    console.error("Erro ao exportar como imagem:", error)
    throw error
  }
}
