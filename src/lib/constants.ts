// Valores aceitos pela API e seus rótulos de exibição

export const CATEGORIAS = [
    { valor: "roupas", rotulo: "Roupas" },
    { valor: "agasalhos", rotulo: "Agasalhos" },
    { valor: "calcados", rotulo: "Calçados" },
    { valor: "acessorios", rotulo: "Acessórios" },
    { valor: "infantil", rotulo: "Infantil" },
]

export const CONDICOES = [
    { valor: "novo", rotulo: "Novo (com etiqueta)" },
    { valor: "usado_excelente", rotulo: "Usado (excelente)" },
    { valor: "usado_marcas", rotulo: "Usado (com marcas)" },
]

export const TAMANHOS_LETRA = [
    { valor: "PP", rotulo: "PP" },
    { valor: "P", rotulo: "P" },
    { valor: "M", rotulo: "M" },
    { valor: "G", rotulo: "G" },
    { valor: "GG", rotulo: "GG" },
    { valor: "UNICO", rotulo: "Único" },
]

export const TAMANHOS_NUMERICOS = Array.from({ length: 31 }, (_, i) => String(16 + i))

export const NECESSIDADES = [
    { valor: "roupas", rotulo: "Roupas" },
    { valor: "calcados", rotulo: "Calçados" },
    { valor: "agasalhos", rotulo: "Agasalhos" },
    { valor: "acessorios", rotulo: "Acessórios" },
]

export const TIPOS_ENTREGA = [
    { valor: "levar", rotulo: "Eu levo até a pessoa", rotuloCurto: "Doador leva até você" },
    { valor: "frete", rotulo: "Envio por frete", rotuloCurto: "Envio por frete" },
]

export const UFS = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
    "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]

const rotulos = (lista: { valor: string; rotulo: string }[]) =>
    Object.fromEntries(lista.map(({ valor, rotulo }) => [valor, rotulo]))

const ROTULO_CATEGORIA = rotulos(CATEGORIAS)
const ROTULO_CONDICAO = rotulos(CONDICOES)
const ROTULO_TAMANHO = rotulos(TAMANHOS_LETRA)
const ROTULO_NECESSIDADE = rotulos(NECESSIDADES)

export const rotuloCategoria = (valor: string) => ROTULO_CATEGORIA[valor] ?? valor
export const rotuloCondicao = (valor: string) => ROTULO_CONDICAO[valor] ?? valor
export const rotuloTamanho = (valor: string) => ROTULO_TAMANHO[valor] ?? valor
export const rotuloNecessidade = (valor: string) => ROTULO_NECESSIDADE[valor] ?? valor
export const rotuloEntrega = (valor: string) => TIPOS_ENTREGA.find((t) => t.valor === valor)?.rotuloCurto ?? valor
export const rotuloTipo = (tipo: string) => (tipo === "doador" ? "Doador" : "Acolhido")

// tamanho máximo da foto original escolhida; antes do envio ela é reduzida no navegador (src/lib/imagem.ts)
export const TAMANHO_MAXIMO_FOTO = 20 * 1024 * 1024
export const MAXIMO_FOTOS = 4
