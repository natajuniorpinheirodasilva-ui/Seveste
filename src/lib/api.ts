// Cliente da API em Go. As chamadas passam pelo proxy do Next (/api/* -> API),
// então o cookie de sessão httpOnly é enviado automaticamente.

const BASE_URL = "/api/v1"

export class ApiError extends Error {
    status: number

    constructor(status: number, message: string) {
        super(message)
        this.status = status
    }
}

type Opcoes = {
    method?: "GET" | "POST" | "PATCH" | "DELETE"
    body?: unknown
    signal?: AbortSignal
}

export async function api<T = unknown>(caminho: string, { method = "GET", body, signal }: Opcoes = {}): Promise<T> {
    const init: RequestInit = { method, signal, credentials: "same-origin", headers: {} }

    if (body instanceof FormData) {
        init.body = body
    } else if (body !== undefined) {
        init.body = JSON.stringify(body)
        init.headers = { "Content-Type": "application/json" }
    }

    let resposta: Response
    try {
        resposta = await fetch(`${BASE_URL}${caminho}`, init)
    } catch (erro) {
        if (erro instanceof DOMException && erro.name === "AbortError") throw erro
        throw new ApiError(0, "Não foi possível conectar ao servidor. Verifique sua conexão.")
    }

    if (resposta.status === 204) return undefined as T

    const dados = await resposta.json().catch(() => null)

    if (!resposta.ok) {
        const mensagem = typeof dados?.erro === "string"
            ? capitalizar(dados.erro)
            : resposta.status >= 500
                ? "O servidor está indisponível no momento. Tente novamente em instantes."
                : "Não foi possível concluir a operação."
        throw new ApiError(resposta.status, mensagem)
    }

    return dados as T
}

export function urlFoto(nome: string) {
    return `${BASE_URL}/uploads/${encodeURIComponent(nome)}`
}

export function mensagemDeErro(erro: unknown) {
    if (erro instanceof Error) return erro.message
    return "Algo deu errado. Tente novamente."
}

function capitalizar(texto: string) {
    return texto.charAt(0).toUpperCase() + texto.slice(1)
}
