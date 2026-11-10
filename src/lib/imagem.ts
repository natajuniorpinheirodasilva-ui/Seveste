// Reduz uma foto no navegador antes do envio. As fotos ficam guardadas no banco (Prisma Postgres, plano
// gratuito) e cada requisição na Vercel aceita no máximo 4,5 MB, então quanto menor, melhor.

const LADO_MAXIMO = 1280
export const TAMANHO_MAXIMO_COMPRIMIDA = 1024 * 1024 // 1 MB, o mesmo limite da API

function gerarBlob(canvas: HTMLCanvasElement, tipo: string, qualidade: number) {
    return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, tipo, qualidade))
}

function desenhar(imagem: ImageBitmap, ladoMaximo: number) {
    const escala = Math.min(1, ladoMaximo / Math.max(imagem.width, imagem.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(imagem.width * escala)
    canvas.height = Math.round(imagem.height * escala)
    canvas.getContext("2d")?.drawImage(imagem, 0, 0, canvas.width, canvas.height)
    return canvas
}

// Devolve a foto redimensionada (lado maior de até 1280px) em WEBP, ou JPEG nos navegadores sem WEBP.
// Também remove os metadados da foto original (como a localização GPS), o que é bom para a privacidade.
export async function comprimirImagem(arquivo: File): Promise<File> {
    const imagem = await createImageBitmap(arquivo)

    try {
        for (const [ladoMaximo, qualidade] of [[LADO_MAXIMO, 0.8], [1024, 0.65], [800, 0.55]] as const) {
            const canvas = desenhar(imagem, ladoMaximo)

            let blob = await gerarBlob(canvas, "image/webp", qualidade)
            if (!blob || blob.type !== "image/webp") {
                blob = await gerarBlob(canvas, "image/jpeg", qualidade)
            }

            if (blob && blob.size <= TAMANHO_MAXIMO_COMPRIMIDA) {
                const extensao = blob.type === "image/webp" ? "webp" : "jpg"
                const nome = arquivo.name.replace(/\.[^.]+$/, "") + "." + extensao
                return new File([blob], nome, { type: blob.type })
            }
        }
    } finally {
        imagem.close()
    }

    throw new Error(`Não foi possível reduzir "${arquivo.name}" para menos de 1MB.`)
}
