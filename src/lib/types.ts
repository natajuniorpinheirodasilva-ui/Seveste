// Tipos que espelham as respostas da API em Go (campos em snake_case, como no back-end)

export type TipoUsuario = "doador" | "acolhido"

export type UsuarioPublico = {
    id_usuario: number
    nome: string
    uf: string
    cidade: string
    tipo: TipoUsuario
    bio: string
    criado_em: string
}

export type Usuario = UsuarioPublico & {
    email: string
    telefone: string
    rua: string
    numero: string
    complemento: string
    roupas_procuradas: string[] | null
    tamanho_roupa: string
    tamanho_calcado: number
    consentimento_em: string
    versao_politica: string
}

export type Estatisticas = {
    doacoes_realizadas: number
    doacoes_recebidas: number
    media_avaliacoes: number
    total_avaliacoes: number
}

export type StatusDoacao = "disponivel" | "doada"

// "levar": o doador leva até o acolhido; "frete": a peça é enviada por frete
export type TipoEntrega = "levar" | "frete"

export type Doacao = {
    id_doacao: number
    titulo: string
    descricao: string
    categoria: string
    tamanho: string
    condicao: string
    tipo_de_entrega: TipoEntrega
    status: StatusDoacao
    cor: string
    material: string
    local: string
    cidade: string
    uf: string
    fotos: string[]
    criado_em: string
    usuario_id: number
    doador: UsuarioPublico | null
    total_solicitacoes: number
    favoritada: boolean
}

// Dados de contato da outra parte, liberados só depois que a solicitação é aceita.
// O endereço completo (rua, número...) só vem para o doador.
export type Contato = {
    nome: string
    email: string
    telefone: string
    rua?: string
    numero?: string
    complemento?: string
    cidade: string
    uf: string
}

export type StatusSolicitacao = "PENDENTE" | "ACEITA" | "RECUSADA"

export type Solicitacao = {
    id_solicitacao: number
    status: StatusSolicitacao
    criado_em: string
    id_doacao: number
    id_usuario: number
    doacao: {
        id_doacao: number
        titulo: string
        status: StatusDoacao
        tipo_de_entrega: TipoEntrega
        fotos: string[]
        usuario_id: number
    } | null
    solicitante: UsuarioPublico | null
    doador: UsuarioPublico | null
    contato: Contato | null
    avaliada_por_mim: boolean
}

export type Avaliacao = {
    id_avaliacao: number
    id_solicitacao: number
    id_autor: number
    id_avaliado: number
    nota: number
    comentario: string
    criado_em: string
    autor: UsuarioPublico | null
}
