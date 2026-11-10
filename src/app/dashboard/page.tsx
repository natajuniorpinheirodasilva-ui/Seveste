"use client"

import { use, useCallback, useEffect, useState } from "react"
import Navbar from "@/components/Navbar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRequireAuth } from "@/components/AuthProvider"
import AccountSettings from "@/components/AccountSettings"
import ContactCard from "@/components/ContactCard"
import DonationPhoto from "@/components/DonationPhoto"
import { EmptyState, ErrorMessage, Loading } from "@/components/Feedback"
import { api, mensagemDeErro } from "@/lib/api"
import { localizacao, tempoRelativo } from "@/lib/format"
import type { Doacao, Solicitacao, StatusSolicitacao } from "@/lib/types"
import {
    Package,
    Heart,
    History,
    Edit3,
    Trash2,
    CheckCircle2,
    MapPin,
    Inbox,
    Contact,
    Star,
    UserCog,
    PlusCircle,
    X,
    type LucideIcon
} from "lucide-react"

type Aba = "ativos" | "solicitacoes" | "historico" | "salvos" | "dados"

const STATUS: Record<StatusSolicitacao, { rotulo: string; classe: string }> = {
    PENDENTE: { rotulo: "Aguardando", classe: "border-orange-200 bg-orange-50 text-orange-700" },
    ACEITA: { rotulo: "Concluída", classe: "border-seveste-green/30 bg-seveste-green/10 text-seveste-green" },
    RECUSADA: { rotulo: "Não aceita", classe: "border-gray-200 bg-slate-50 text-seveste-muted" },
}

const botaoSecundario = "flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-seveste-dark transition-colors hover:bg-slate-50"

export default function Dashboard({
    searchParams,
}: {
    searchParams: Promise<{ aba?: string | string[] }>
}) {
    const { aba } = use(searchParams)
    const { usuario, carregando } = useRequireAuth()
    const router = useRouter()
    const ehDoador = usuario?.tipo === "doador"

    const [activeTab, setActiveTab] = useState<Aba | null>(null)
    const [doacoes, setDoacoes] = useState<Doacao[]>([])
    const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
    const [salvos, setSalvos] = useState<Doacao[]>([])
    const [carregandoDados, setCarregandoDados] = useState(true)
    const [erro, setErro] = useState<string | null>(null)
    const [concluindo, setConcluindo] = useState<number | null>(null)
    const [excluindo, setExcluindo] = useState<number | null>(null)
    const [processando, setProcessando] = useState(false)
    const [contatoAberto, setContatoAberto] = useState<number | null>(null)

    const abas: { id: Aba; rotulo: string; icon: LucideIcon }[] = ehDoador
        ? [
            { id: "ativos", rotulo: `Anúncios Ativos (${doacoes.filter((d) => d.status === "disponivel").length})`, icon: Package },
            { id: "solicitacoes", rotulo: `Solicitações (${solicitacoes.filter((s) => s.status === "PENDENTE").length})`, icon: Inbox },
            { id: "historico", rotulo: "Histórico", icon: History },
            { id: "salvos", rotulo: "Itens Salvos", icon: Heart },
            { id: "dados", rotulo: "Meus dados", icon: UserCog },
        ]
        : [
            { id: "solicitacoes", rotulo: `Minhas solicitações (${solicitacoes.length})`, icon: Inbox },
            { id: "salvos", rotulo: "Itens Salvos", icon: Heart },
            { id: "dados", rotulo: "Meus dados", icon: UserCog },
        ]

    // a aba pode vir pela URL (?aba=dados); se não for válida para o tipo de usuário, usa a primeira
    const abaAtual: Aba = activeTab ?? (abas.some(({ id }) => id === aba) ? (aba as Aba) : abas[0].id)

    const carregar = useCallback(async () => {
        if (!usuario) return
        try {
            const [lista, favoritos] = await Promise.all([
                usuario.tipo === "doador"
                    ? api<{ solicitacoes: Solicitacao[] }>("/solicitacoes/recebidas")
                    : api<{ solicitacoes: Solicitacao[] }>("/solicitacoes/minhas"),
                api<{ doacoes: Doacao[] }>("/favoritos"),
            ])
            setSolicitacoes(lista.solicitacoes)
            setSalvos(favoritos.doacoes)

            if (usuario.tipo === "doador") {
                const minhas = await api<{ doacoes: Doacao[] }>(`/doacoes?usuario_id=${usuario.id_usuario}&status=todas`)
                setDoacoes(minhas.doacoes)
            }
        } catch (e) {
            setErro(mensagemDeErro(e))
        } finally {
            setCarregandoDados(false)
        }
    }, [usuario])

    useEffect(() => {
        const timer = setTimeout(carregar, 0)
        return () => clearTimeout(timer)
    }, [carregar])

    const executar = async (acao: () => Promise<void>) => {
        setProcessando(true)
        setErro(null)
        try {
            await acao()
        } catch (e) {
            setErro(mensagemDeErro(e))
        } finally {
            setProcessando(false)
        }
    }

    const aceitar = (solicitacao: Solicitacao) => executar(async () => {
        await api(`/solicitacoes/${solicitacao.id_solicitacao}`, { method: "PATCH", body: { status: "ACEITA" } })
        router.push(`/success?solicitacao=${solicitacao.id_solicitacao}`)
    })

    const recusar = (solicitacao: Solicitacao) => executar(async () => {
        await api(`/solicitacoes/${solicitacao.id_solicitacao}`, { method: "PATCH", body: { status: "RECUSADA" } })
        await carregar()
    })

    const cancelar = (solicitacao: Solicitacao) => executar(async () => {
        await api(`/solicitacoes/${solicitacao.id_solicitacao}`, { method: "DELETE" })
        await carregar()
    })

    const excluirDoacao = (id: number) => executar(async () => {
        await api(`/doacoes/${id}`, { method: "DELETE" })
        setExcluindo(null)
        await carregar()
    })

    const removerSalvo = (id: number) => executar(async () => {
        await api(`/favoritos/${id}`, { method: "DELETE" })
        setSalvos((atual) => atual.filter((d) => d.id_doacao !== id))
    })

    if (carregando || !usuario) {
        return (
            <div className="min-h-screen bg-slate-50 text-seveste-text pb-20">
                <header>
                    <Navbar />
                </header>
                <main className="mx-auto max-w-6xl px-6 py-8 md:px-12 lg:py-12">
                    <Loading />
                </main>
            </div>
        )
    }

    const ativos = doacoes.filter((d) => d.status === "disponivel")
    const doadas = doacoes.filter((d) => d.status === "doada")
    const pendentesDa = (doacaoId: number) => solicitacoes.filter((s) => s.id_doacao === doacaoId && s.status === "PENDENTE")

    const renderSolicitacao = (s: Solicitacao) => {
        // para o doador, a outra parte é quem solicitou; para o acolhido, é o doador
        const outraParte = ehDoador ? s.solicitante : s.doador
        const status = STATUS[s.status]

        return (
            <div key={s.id_solicitacao} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link href={`/products/${s.id_doacao}`} className="relative flex h-16 w-16 shrink-0 items-center justify-center self-center overflow-hidden rounded-xl bg-slate-100">
                    <DonationPhoto foto={s.doacao?.fotos[0]} alt={s.doacao?.titulo ?? "Doação"} iconClassName="h-6 w-6" />
                </Link>
                <div className="flex-1 text-center sm:text-left">
                    <h4 className="font-bold text-seveste-dark">{s.doacao?.titulo ?? "Doação removida"}</h4>
                    <p className="text-sm text-seveste-muted">
                        {ehDoador ? "Solicitado por " : "Doador: "}
                        {outraParte ? (
                            <Link href={`/profile/${outraParte.id_usuario}`} className="font-medium text-seveste-dark hover:text-seveste-green">{outraParte.nome}</Link>
                        ) : "usuário removido"}
                        {" "}• {tempoRelativo(s.criado_em)}
                    </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className={`rounded-full border px-3 py-1 text-sm font-medium ${status.classe}`}>{status.rotulo}</span>
                    {s.contato && (
                        <button
                            onClick={() => setContatoAberto(contatoAberto === s.id_solicitacao ? null : s.id_solicitacao)}
                            aria-expanded={contatoAberto === s.id_solicitacao}
                            className={botaoSecundario}
                        >
                            <Contact className="h-3.5 w-3.5" /> {contatoAberto === s.id_solicitacao ? "Ocultar contato" : "Ver contato"}
                        </button>
                    )}
                    {ehDoador && s.status === "PENDENTE" && (
                        <>
                            <button
                                disabled={processando}
                                onClick={() => aceitar(s)}
                                className="flex items-center justify-center gap-1.5 rounded-lg bg-seveste-green px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-60"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Doar
                            </button>
                            <button disabled={processando} onClick={() => recusar(s)} className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60">
                                Recusar
                            </button>
                        </>
                    )}
                    {!ehDoador && s.status === "PENDENTE" && (
                        <button disabled={processando} onClick={() => cancelar(s)} className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60">
                            Cancelar
                        </button>
                    )}
                    {s.status === "ACEITA" && !s.avaliada_por_mim && (
                        <Link href={`/success?solicitacao=${s.id_solicitacao}`} className="flex items-center gap-1.5 rounded-lg bg-yellow-50 px-3 py-2 text-sm font-semibold text-yellow-700 transition-colors hover:bg-yellow-100">
                            <Star className="h-3.5 w-3.5" /> Avaliar
                        </Link>
                    )}
                </div>
            </div>
            {s.contato && contatoAberto === s.id_solicitacao && (
                <div className="mt-4">
                    <ContactCard contato={s.contato} tipoEntrega={s.doacao?.tipo_de_entrega} souDoador={ehDoador} />
                </div>
            )}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 text-seveste-text pb-20">
            <header>
                <Navbar />
            </header>

            <main className="mx-auto max-w-6xl px-6 py-8 md:px-12 lg:py-12">

                <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Minha Conta</h1>
                        <p className="mt-2 text-seveste-muted">
                            Olá, {usuario.nome.split(" ")[0]}! {ehDoador
                                ? "Gerencie seus anúncios, solicitações e histórico de doações."
                                : "Acompanhe suas solicitações e os itens que você salvou."}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href={`/profile/${usuario.id_usuario}`} className={botaoSecundario}>
                            Ver meu perfil
                        </Link>
                        {ehDoador && (
                            <Link href="/announce" className="flex items-center gap-2 rounded-lg bg-seveste-dark px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-seveste-green">
                                <PlusCircle className="h-4 w-4" /> Nova doação
                            </Link>
                        )}
                    </div>
                </div>

                {/* Navegação de Abas */}
                <div className="mb-8 flex overflow-x-auto border-b border-gray-200 hide-scrollbar" role="tablist">
                    {abas.map(({ id, rotulo, icon: Icon }) => (
                        <button
                            key={id}
                            role="tab"
                            aria-selected={abaAtual === id}
                            onClick={() => setActiveTab(id)}
                            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${abaAtual === id
                                ? "border-seveste-green text-seveste-green"
                                : "border-transparent text-seveste-muted hover:text-seveste-dark"
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {rotulo}
                        </button>
                    ))}
                </div>

                {erro && <div className="mb-6"><ErrorMessage mensagem={erro} /></div>}

                {/* Conteúdo das Abas */}
                <div className="min-h-[40vh]">

                    {carregandoDados && abaAtual !== "dados" && <Loading />}

                    {/* ABA: ATIVOS */}
                    {!carregandoDados && abaAtual === "ativos" && (
                        ativos.length === 0 ? (
                            <EmptyState icon={Package} titulo="Nenhum anúncio ativo" descricao="Publique uma peça para que ela apareça na vitrine.">
                                <Link href="/announce" className="rounded-lg bg-seveste-dark px-5 py-3 text-sm font-semibold text-white hover:bg-seveste-green">Anunciar doação</Link>
                            </EmptyState>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {ativos.map((item) => {
                                    const pendentes = pendentesDa(item.id_doacao)
                                    return (
                                        <div key={item.id_doacao} className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
                                            <Link href={`/products/${item.id_doacao}`} className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-slate-100">
                                                <DonationPhoto foto={item.fotos[0]} alt={item.titulo} iconClassName="h-8 w-8" />
                                                {pendentes.length > 0 && (
                                                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700">
                                                        {pendentes.length} {pendentes.length === 1 ? "interessado" : "interessados"}
                                                    </div>
                                                )}
                                            </Link>
                                            <div className="flex flex-1 flex-col p-5">
                                                <h3 className="mb-1 font-bold text-seveste-dark">
                                                    {item.titulo}
                                                </h3>
                                                <p className="mb-4 text-sm text-seveste-muted">Publicado {tempoRelativo(item.criado_em)}</p>

                                                {concluindo === item.id_doacao && (
                                                    <div className="mb-4 rounded-xl border border-seveste-green/30 bg-seveste-green/5 p-3">
                                                        <div className="mb-2 flex items-center justify-between">
                                                            <span className="text-sm font-semibold text-seveste-dark">Doar para:</span>
                                                            <button onClick={() => setConcluindo(null)} aria-label="Fechar" className="text-seveste-muted hover:text-seveste-dark">
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                        {pendentes.length === 0 ? (
                                                            <p className="text-sm text-seveste-muted">Ainda não há pessoas interessadas nesta peça.</p>
                                                        ) : (
                                                            <ul className="flex flex-col gap-2">
                                                                {pendentes.map((s) => (
                                                                    <li key={s.id_solicitacao}>
                                                                        <button
                                                                            disabled={processando}
                                                                            onClick={() => aceitar(s)}
                                                                            className="flex w-full items-center justify-between rounded-lg bg-white px-3 py-2 text-left text-sm transition-colors hover:bg-seveste-green hover:text-white disabled:opacity-60"
                                                                        >
                                                                            <span className="font-medium">{s.solicitante?.nome ?? "Usuário"}</span>
                                                                            <span className="text-xs opacity-75">{s.solicitante?.cidade}</span>
                                                                        </button>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="mt-auto flex flex-col gap-2 border-t border-gray-100 pt-4">
                                                    <button
                                                        onClick={() => setConcluindo(concluindo === item.id_doacao ? null : item.id_doacao)}
                                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-seveste-green px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        Concluir doação
                                                    </button>
                                                    {excluindo === item.id_doacao ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="flex-1 text-sm text-red-600">Excluir anúncio?</span>
                                                            <button disabled={processando} onClick={() => excluirDoacao(item.id_doacao)} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">Sim</button>
                                                            <button onClick={() => setExcluindo(null)} className={botaoSecundario}>Não</button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <Link href={`/announce?editar=${item.id_doacao}`} className={`${botaoSecundario} flex-1`}>
                                                                <Edit3 className="h-3.5 w-3.5" /> Editar
                                                            </Link>
                                                            <button onClick={() => setExcluindo(item.id_doacao)} aria-label="Excluir anúncio" className="flex items-center justify-center rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-red-600 transition-colors hover:bg-red-100">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    )}

                    {/* ABA: SOLICITAÇÕES */}
                    {!carregandoDados && abaAtual === "solicitacoes" && (
                        solicitacoes.length === 0 ? (
                            <EmptyState
                                icon={Inbox}
                                titulo={ehDoador ? "Nenhuma solicitação recebida" : "Você ainda não solicitou nenhuma peça"}
                                descricao={ehDoador ? "Quando alguém se interessar pelas suas peças, aparecerá aqui." : "Explore a vitrine e entre em contato com quem está doando."}
                            >
                                {!ehDoador && (
                                    <Link href="/products" className="rounded-lg bg-seveste-dark px-5 py-3 text-sm font-semibold text-white hover:bg-seveste-green">Ver vitrine</Link>
                                )}
                            </EmptyState>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {solicitacoes.map(renderSolicitacao)}
                            </div>
                        )
                    )}

                    {/* ABA: HISTÓRICO */}
                    {!carregandoDados && abaAtual === "historico" && (
                        doadas.length === 0 ? (
                            <EmptyState icon={History} titulo="Nenhuma doação concluída ainda" descricao="Suas doações finalizadas aparecerão aqui." />
                        ) : (
                            <div className="flex flex-col gap-4">
                                {doadas.map((item) => {
                                    const aceita = solicitacoes.find((s) => s.id_doacao === item.id_doacao && s.status === "ACEITA")
                                    return (
                                        <div key={item.id_doacao} className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                                            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                                                <DonationPhoto foto={item.fotos[0]} alt={item.titulo} iconClassName="h-6 w-6" />
                                            </div>
                                            <div className="flex-1 text-center sm:text-left">
                                                <h4 className="font-bold text-seveste-dark">{item.titulo}</h4>
                                                <p className="text-sm text-seveste-muted">
                                                    {aceita?.solicitante ? `Doado para ${aceita.solicitante.nome}` : "Doação concluída"}
                                                </p>
                                            </div>
                                            {aceita && !aceita.avaliada_por_mim && (
                                                <Link href={`/success?solicitacao=${aceita.id_solicitacao}`} className="flex items-center gap-1.5 rounded-lg bg-yellow-50 px-3 py-2 text-sm font-semibold text-yellow-700 transition-colors hover:bg-yellow-100">
                                                    <Star className="h-3.5 w-3.5" /> Avaliar
                                                </Link>
                                            )}
                                            <div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-sm font-medium text-seveste-dark border border-gray-200">
                                                Finalizado
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    )}

                    {/* ABA: SALVOS */}
                    {!carregandoDados && abaAtual === "salvos" && (
                        salvos.length === 0 ? (
                            <EmptyState icon={Heart} titulo="Nenhum item salvo" descricao="Toque no coração de uma peça para guardá-la aqui." />
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {salvos.map((item) => (
                                    <div key={item.id_doacao} className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-seveste-green">
                                        <Link href={`/products/${item.id_doacao}`} className="relative flex aspect-4/3 w-full items-center justify-center overflow-hidden bg-slate-100">
                                            <DonationPhoto foto={item.fotos[0]} alt={item.titulo} iconClassName="h-8 w-8 transition-transform group-hover:scale-110" />
                                        </Link>
                                        <button
                                            onClick={() => removerSalvo(item.id_doacao)}
                                            aria-label="Remover dos itens salvos"
                                            className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 text-red-500 shadow-sm"
                                        >
                                            <Heart className="h-5 w-5 fill-current" />
                                        </button>
                                        <Link href={`/products/${item.id_doacao}`} className="p-4">
                                            <h3 className="mb-1 font-bold text-seveste-dark group-hover:text-seveste-green">{item.titulo}</h3>
                                            <div className="flex items-center gap-1.5 text-xs text-seveste-muted">
                                                <MapPin className="h-3 w-3" /> {localizacao(item.cidade, item.uf)}
                                                {item.status === "doada" && <span className="ml-auto font-semibold text-seveste-muted">Já doada</span>}
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* ABA: MEUS DADOS */}
                    {abaAtual === "dados" && <AccountSettings usuario={usuario} />}

                </div>
            </main>
        </div>
    )
}
