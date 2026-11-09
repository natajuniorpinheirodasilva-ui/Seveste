const relativo = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" })

const UNIDADES: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
]

// ex.: "há 2 horas", "ontem"
export function tempoRelativo(data: string) {
    const segundos = (new Date(data).getTime() - Date.now()) / 1000

    for (const [unidade, duracao] of UNIDADES) {
        if (Math.abs(segundos) >= duracao) {
            return relativo.format(Math.round(segundos / duracao), unidade)
        }
    }

    return "agora mesmo"
}

export function dataCurta(data: string) {
    return new Date(data).toLocaleDateString("pt-BR")
}

export function horaCurta(data: string) {
    const d = new Date(data)
    const hoje = new Date()
    if (d.toDateString() === hoje.toDateString()) {
        return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    }
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}

export function anoDe(data: string) {
    return new Date(data).getFullYear()
}

export function inicial(nome?: string | null) {
    return (nome?.trim().charAt(0) || "?").toUpperCase()
}

export function localizacao(cidade?: string, uf?: string, local?: string) {
    const regiao = [cidade, uf].filter(Boolean).join(" - ")
    return [local, regiao].filter(Boolean).join(", ")
}
