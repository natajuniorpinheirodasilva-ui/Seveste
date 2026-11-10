"use client"

import { use, useEffect, useState } from "react"
import Navbar from "@/components/Navbar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"
import DonationPhoto from "@/components/DonationPhoto"
import Stars from "@/components/Stars"
import { ErrorMessage, Loading } from "@/components/Feedback"
import { api, ApiError, mensagemDeErro } from "@/lib/api"
import { rotuloCategoria, rotuloCondicao, rotuloEntrega, rotuloTamanho } from "@/lib/constants"
import { anoDe, localizacao, tempoRelativo } from "@/lib/format"
import type { Doacao, Estatisticas, Solicitacao } from "@/lib/types"
import {
    ChevronRight,
    MapPin,
    HandHeart,
    User,
    Clock,
    ShieldAlert,
    Heart,
    Tag,
    Share2,
    Users,
    Palette,
    Layers,
    Info,
    Edit3,
    SearchX,
    CheckCircle2,
    Truck,
    Hourglass
} from "lucide-react"

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { usuario } = useAuth()
    const router = useRouter()

    const [doacao, setDoacao] = useState<Doacao | null>(null)
    const [estatisticasDoador, setEstatisticasDoador] = useState<Estatisticas | null>(null)
    const [similares, setSimilares] = useState<Doacao[]>([])
    const [naoEncontrada, setNaoEncontrada] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const [fotoAtiva, setFotoAtiva] = useState(0)
    const [favoritada, setFavoritada] = useState(false)
    const [solicitando, setSolicitando] = useState(false)
    const [erroAcao, setErroAcao] = useState<string | null>(null)
    const [linkCopiado, setLinkCopiado] = useState(false)
    // solicitação ativa do acolhido logado para esta peça (se houver)
    const [minhaSolicitacao, setMinhaSolicitacao] = useState<Solicitacao | null>(null)

    // recarrega quando o usuário loga/desloga, para atualizar o estado de favorito
    const usuarioId = usuario?.id_usuario

    useEffect(() => {
        const controller = new AbortController()
        const { signal } = controller

        api<{ doacao: Doacao }>(`/doacoes/${id}`, { signal })
            .then(({ doacao }) => {
                setDoacao(doacao)
                setFavoritada(doacao.favoritada)
                setFotoAtiva(0)

                api<{ estatisticas: Estatisticas }>(`/usuarios/${doacao.usuario_id}`, { signal })
                    .then(({ estatisticas }) => setEstatisticasDoador(estatisticas))
                    .catch(() => undefined)

                api<{ doacoes: Doacao[] }>(`/doacoes?categoria=${doacao.categoria}&excluir=${doacao.id_doacao}&limite=4`, { signal })
                    .then(({ doacoes }) => setSimilares(doacoes))
                    .catch(() => undefined)
            })
            .catch((e) => {
                if (signal.aborted) return
                if (e instanceof ApiError && (e.status === 404 || e.status === 400)) setNaoEncontrada(true)
                else setErro(mensagemDeErro(e))
            })

        return () => controller.abort()
    }, [id, usuarioId])

    const ehAcolhido = usuario?.tipo === "acolhido"
    useEffect(() => {
        if (!ehAcolhido) return
        const controller = new AbortController()

        api<{ solicitacoes: Solicitacao[] }>("/solicitacoes/minhas", { signal: controller.signal })
            .then(({ solicitacoes }) => setMinhaSolicitacao(
                solicitacoes.find((s) => s.id_doacao === Number(id) && s.status !== "RECUSADA") ?? null
            ))
            .catch(() => undefined)

        return () => controller.abort()
    }, [id, ehAcolhido])

    const exigirLogin = () => router.push(`/login?next=${encodeURIComponent(`/products/${id}`)}`)

    const handleFavoritar = async () => {
        if (!usuario || !doacao) return exigirLogin()

        const novoValor = !favoritada
        setFavoritada(novoValor)
        try {
            await api(`/favoritos/${doacao.id_doacao}`, { method: novoValor ? "POST" : "DELETE" })
        } catch {
            setFavoritada(!novoValor)
        }
    }

    const handleCompartilhar = async () => {
        const url = window.location.href
        try {
            if (navigator.share) {
                await navigator.share({ title: doacao?.titulo, url })
                return
            }
            await navigator.clipboard.writeText(url)
            setLinkCopiado(true)
            setTimeout(() => setLinkCopiado(false), 2500)
        } catch {
            // compartilhamento cancelado pelo usuário
        }
    }

    const handleSolicitar = async () => {
        if (!usuario || !doacao) return exigirLogin()

        setSolicitando(true)
        setErroAcao(null)
        try {
            const solicitacao = await api<Solicitacao>("/solicitacoes", {
                method: "POST",
                body: { id_doacao: doacao.id_doacao },
            })
            setMinhaSolicitacao(solicitacao)
            setDoacao({ ...doacao, total_solicitacoes: Math.max(doacao.total_solicitacoes, 1) })
        } catch (e) {
            setErroAcao(mensagemDeErro(e))
        } finally {
            setSolicitando(false)
        }
    }

    if (naoEncontrada) {
        return (
            <div className="min-h-screen bg-slate-50 text-seveste-text">
                <header>
                    <Navbar />
                </header>
                <main className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
                    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-200 text-seveste-muted shadow-inner">
                        <SearchX className="h-12 w-12" />
                    </div>
                    <h1 className="mb-3 text-3xl font-bold text-seveste-dark">Doação não encontrada</h1>
                    <p className="mb-8 max-w-md text-seveste-muted">O anúncio pode ter sido removido pelo doador ou o endereço está incorreto.</p>
                    <Link href="/products" className="rounded-xl bg-seveste-dark px-6 py-4 font-semibold text-white transition-all hover:-translate-y-1 hover:bg-seveste-green">
                        Ver vitrine de doações
                    </Link>
                </main>
            </div>
        )
    }

    if (!doacao) {
        return (
            <div className="min-h-screen bg-slate-50 text-seveste-text">
                <header>
                    <Navbar />
                </header>
                <main className="mx-auto max-w-6xl px-6 py-12 md:px-12">
                    {erro ? <ErrorMessage mensagem={erro} /> : <Loading />}
                </main>
            </div>
        )
    }

    const ehDono = usuario?.id_usuario === doacao.usuario_id
    const disponivel = doacao.status === "disponivel"
    const doador = doacao.doador

    const caracteristicas = [
        { icon: Tag, rotulo: "Tamanho", valor: rotuloTamanho(doacao.tamanho) },
        { icon: Info, rotulo: "Condição", valor: rotuloCondicao(doacao.condicao) },
        { icon: Palette, rotulo: "Cor", valor: doacao.cor || "Não informada" },
        { icon: Layers, rotulo: "Material", valor: doacao.material || "Não informado" },
        { icon: Truck, rotulo: "Entrega", valor: rotuloEntrega(doacao.tipo_de_entrega) },
    ]

    return (
        <div className="min-h-screen bg-slate-50 text-seveste-text pb-20">
            <header>
                <Navbar />
            </header>

            <main className="mx-auto max-w-6xl px-6 py-8 md:px-12 lg:py-12">

                {/* Breadcrumbs */}
                <nav className="mb-8 flex flex-wrap items-center text-sm text-seveste-muted">
                    <Link href="/" className="transition-colors hover:text-seveste-green">Início</Link>
                    <ChevronRight className="mx-2 h-4 w-4" />
                    <Link href="/products" className="transition-colors hover:text-seveste-green">Vitrine</Link>
                    <ChevronRight className="mx-2 h-4 w-4" />
                    <Link href={`/products?cat=${doacao.categoria}`} className="transition-colors hover:text-seveste-green">{rotuloCategoria(doacao.categoria)}</Link>
                    <ChevronRight className="mx-2 h-4 w-4" />
                    <span className="font-medium text-seveste-dark">{doacao.titulo}</span>
                </nav>

                <div className="flex flex-col gap-10 lg:flex-row lg:items-start">

                    {/* Coluna Esquerda: Galeria */}
                    <div className="flex w-full flex-col gap-4 lg:w-3/5 lg:sticky lg:top-24">
                        {/* Imagem Principal */}
                        <div className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-200 md:aspect-4/3">
                            <DonationPhoto
                                foto={doacao.fotos[fotoAtiva]}
                                alt={doacao.titulo}
                                iconClassName="h-16 w-16 text-slate-400 transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Badges flutuantes na imagem */}
                            <div className="absolute left-4 top-4 flex flex-col gap-2">
                                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md ${disponivel ? "bg-seveste-green" : "bg-slate-500"}`}>
                                    {disponivel ? "Para Doação" : "Doação concluída"}
                                </span>
                            </div>

                            {/* Ações na imagem */}
                            {!ehDono && (
                                <button
                                    onClick={handleFavoritar}
                                    aria-pressed={favoritada}
                                    aria-label={favoritada ? "Remover dos itens salvos" : "Salvar item"}
                                    className={`absolute right-4 top-4 rounded-full bg-white/90 p-3 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${favoritada ? "text-red-500" : "text-seveste-muted"}`}
                                >
                                    <Heart className={`h-5 w-5 ${favoritada ? "fill-current" : ""}`} />
                                </button>
                            )}
                        </div>

                        {/* Miniaturas */}
                        {doacao.fotos.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {doacao.fotos.map((foto, index) => (
                                    <button
                                        key={foto}
                                        onClick={() => setFotoAtiva(index)}
                                        aria-label={`Ver foto ${index + 1}`}
                                        className={`group relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-slate-200 transition-all duration-300 hover:opacity-80 ${index === fotoAtiva ? 'ring-2 ring-seveste-green ring-offset-2' : ''}`}
                                    >
                                        <DonationPhoto foto={foto} alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Coluna Direita: Informações e Conversão */}
                    <div className="flex w-full flex-col lg:w-2/5">

                        {/* Cabeçalho do Anúncio */}
                        <div className="mb-6">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-3 text-xs font-medium text-seveste-muted">
                                    {doacao.total_solicitacoes > 0 && (
                                        <span className="flex items-center gap-1 text-orange-500">
                                            <Users className="h-4 w-4" />
                                            {doacao.total_solicitacoes} {doacao.total_solicitacoes === 1 ? "pessoa interessada" : "pessoas interessadas"}
                                        </span>
                                    )}
                                </div>
                                <button onClick={handleCompartilhar} className="flex items-center gap-2 text-sm text-seveste-muted transition-colors hover:text-seveste-dark">
                                    <Share2 className="h-4 w-4" />
                                    {linkCopiado ? "Link copiado!" : "Compartilhar"}
                                </button>
                            </div>

                            <h1 className="mb-4 text-3xl font-bold leading-tight text-seveste-dark md:text-4xl">
                                {doacao.titulo}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-seveste-muted border-b border-gray-200 pb-6">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4 text-seveste-dark" />
                                    Publicado {tempoRelativo(doacao.criado_em)}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4 text-seveste-accent" />
                                    {localizacao(doacao.cidade, doacao.uf, doacao.local)}
                                </div>
                            </div>
                        </div>

                        {/* Perfil do Doador */}
                        {doador && (
                            <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-seveste-green">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-seveste-dark text-white">
                                            <User className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-seveste-dark text-lg">{doador.nome}</h4>
                                            {estatisticasDoador && (
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Stars nota={estatisticasDoador.media_avaliacoes} />
                                                    <span className="text-seveste-muted ml-1">
                                                        ({estatisticasDoador.doacoes_realizadas} {estatisticasDoador.doacoes_realizadas === 1 ? "doação" : "doações"})
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-sm">
                                    <span className="text-seveste-muted">Membro desde <strong className="text-seveste-dark">{anoDe(doador.criado_em)}</strong></span>
                                    <Link href={`/profile/${doador.id_usuario}`} className="font-semibold text-seveste-green transition-colors hover:text-seveste-dark">
                                        Ver perfil completo
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Botão de Ação Principal */}
                        <div className="mb-8">
                            {ehDono ? (
                                <div className="flex flex-col gap-3">
                                    <Link
                                        href={`/announce?editar=${doacao.id_doacao}`}
                                        className="group flex w-full items-center justify-center gap-2 rounded-xl border border-seveste-dark bg-seveste-dark px-6 py-4 font-sans text-lg font-semibold tracking-wide text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-seveste-green hover:bg-seveste-green hover:shadow-xl"
                                    >
                                        <Edit3 className="h-5 w-5" />
                                        Editar anúncio
                                    </Link>
                                    <Link href="/dashboard?aba=solicitacoes" className="text-center text-sm font-semibold text-seveste-green hover:text-seveste-dark">
                                        Ver solicitações recebidas
                                    </Link>
                                </div>
                            ) : minhaSolicitacao ? (
                                <div className="flex flex-col gap-2 rounded-xl border border-seveste-green/30 bg-seveste-green/5 px-5 py-4 text-center">
                                    <span className="flex items-center justify-center gap-2 font-semibold text-seveste-dark">
                                        {minhaSolicitacao.status === "ACEITA" ? <CheckCircle2 className="h-5 w-5 text-seveste-green" /> : <Hourglass className="h-5 w-5 text-seveste-green" />}
                                        {minhaSolicitacao.status === "ACEITA" ? "O doador aceitou sua solicitação!" : "Solicitação enviada"}
                                    </span>
                                    <span className="text-sm text-seveste-muted">
                                        {minhaSolicitacao.status === "ACEITA"
                                            ? "Veja o contato do doador em Minha Conta."
                                            : "Você será avisado em Minha Conta quando o doador responder."}
                                    </span>
                                    <Link href="/dashboard?aba=solicitacoes" className="text-sm font-semibold text-seveste-green hover:text-seveste-dark">
                                        Ver minhas solicitações
                                    </Link>
                                </div>
                            ) : !disponivel ? (
                                <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-slate-100 px-6 py-4 font-semibold text-seveste-muted">
                                    <CheckCircle2 className="h-5 w-5" />
                                    Esta peça já foi doada
                                </div>
                            ) : usuario?.tipo === "doador" ? (
                                <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 text-center text-sm text-seveste-muted">
                                    Apenas pessoas cadastradas como <strong className="text-seveste-dark">acolhidas</strong> podem solicitar doações.
                                </div>
                            ) : (
                                <button
                                    onClick={handleSolicitar}
                                    disabled={solicitando}
                                    className="group flex w-full items-center justify-center gap-2 rounded-xl border border-seveste-dark bg-seveste-dark px-6 py-4 font-sans text-lg font-semibold tracking-wide text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-seveste-green hover:bg-seveste-green hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-seveste-green focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                                >
                                    <HandHeart className="h-6 w-6 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12" />
                                    {!usuario ? "Entrar para solicitar" : solicitando ? "Enviando..." : "Solicitar doação"}
                                </button>
                            )}
                            {erroAcao && <div className="mt-3"><ErrorMessage mensagem={erroAcao} /></div>}
                            <p className="mt-3 text-center text-xs text-seveste-muted flex items-center justify-center gap-1">
                                <ShieldAlert className="h-3 w-3" /> Seu contato só é compartilhado se o doador aceitar a solicitação
                            </p>
                        </div>

                        {/* Especificações Detalhadas */}
                        <div className="mb-8">
                            <h3 className="mb-4 text-lg font-bold text-seveste-dark">Características da peça</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {caracteristicas.map(({ icon: Icon, rotulo, valor }, index) => (
                                    <div key={rotulo} className={`flex flex-col justify-center rounded-xl border border-gray-100 bg-white p-3 shadow-sm ${index === caracteristicas.length - 1 && caracteristicas.length % 2 === 1 ? "col-span-2" : ""}`}>
                                        <span className="mb-1 flex items-center gap-1.5 text-xs text-seveste-muted">
                                            <Icon className="h-3.5 w-3.5" /> {rotulo}
                                        </span>
                                        <span className="font-semibold text-seveste-dark">{valor}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Descrição */}
                        <div className="mb-8 rounded-xl bg-slate-100/50 p-5">
                            <h3 className="mb-3 text-lg font-bold text-seveste-dark">Descrição informada</h3>
                            <p className="whitespace-pre-line leading-relaxed text-seveste-muted">
                                {doacao.descricao}
                            </p>
                        </div>

                        {/* Aviso de Segurança */}
                        <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-5 text-orange-800">
                            <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-orange-600" />
                            <div className="flex flex-col">
                                <h4 className="font-bold text-orange-900 mb-1">Dicas de segurança</h4>
                                <ul className="text-sm leading-relaxed space-y-1 list-disc list-inside">
                                    <li>A Seveste nunca cobra taxas pelas doações.</li>
                                    <li>Não passe seus dados bancários ou senhas.</li>
                                    <li>Se houver frete, combine com antecedência quem vai pagar o envio.</li>
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Seção de Peças Similares */}
                {similares.length > 0 && (
                    <section className="mt-20 border-t border-gray-200 pt-12">
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-seveste-dark">Outras peças que você pode gostar</h2>
                            <Link href={`/products?cat=${doacao.categoria}`} className="hidden text-sm font-semibold text-seveste-green hover:underline md:block">
                                Ver mais
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {similares.map((item) => (
                                <Link
                                    href={`/products/${item.id_doacao}`}
                                    key={item.id_doacao}
                                    className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-seveste-green hover:shadow-xl"
                                >
                                    <div className="relative flex aspect-4/3 w-full items-center justify-center overflow-hidden bg-slate-100">
                                        <DonationPhoto
                                            foto={item.fotos[0]}
                                            alt={item.titulo}
                                            iconClassName="h-8 w-8 transition-transform duration-500 group-hover:scale-125"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="mb-1 text-base font-bold text-seveste-dark transition-colors duration-300 group-hover:text-seveste-green">
                                            {item.titulo}
                                        </h3>
                                        <p className="text-sm text-seveste-muted">Tamanho {rotuloTamanho(item.tamanho)} • {rotuloCondicao(item.condicao)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

            </main>
        </div>
    )
}
