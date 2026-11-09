"use client"

import { use, useEffect, useState } from "react"
import Navbar from "@/components/Navbar"
import Link from "next/link"
import { useAuth } from "@/components/AuthProvider"
import DonationPhoto from "@/components/DonationPhoto"
import Stars from "@/components/Stars"
import { EmptyState, ErrorMessage, Loading } from "@/components/Feedback"
import { api, ApiError, mensagemDeErro } from "@/lib/api"
import { rotuloCondicao, rotuloTamanho, rotuloTipo } from "@/lib/constants"
import { anoDe, tempoRelativo } from "@/lib/format"
import type { Avaliacao, Doacao, Estatisticas, UsuarioPublico } from "@/lib/types"
import {
    MapPin,
    User,
    Award,
    Package,
    ThumbsUp,
    Calendar,
    UserCog,
    SearchX,
    HandHeart
} from "lucide-react"

type Perfil = {
    usuario: UsuarioPublico
    estatisticas: Estatisticas
}

export default function UserProfile({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { usuario: logado } = useAuth()

    const [perfil, setPerfil] = useState<Perfil | null>(null)
    const [doacoes, setDoacoes] = useState<Doacao[]>([])
    const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
    const [mostrarTodas, setMostrarTodas] = useState(false)
    const [naoEncontrado, setNaoEncontrado] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    useEffect(() => {
        const controller = new AbortController()
        const { signal } = controller

        Promise.all([
            api<Perfil>(`/usuarios/${id}`, { signal }),
            api<{ avaliacoes: Avaliacao[] }>(`/usuarios/${id}/avaliacoes`, { signal }),
            api<{ doacoes: Doacao[] }>(`/doacoes?usuario_id=${id}`, { signal }),
        ])
            .then(([perfil, { avaliacoes }, { doacoes }]) => {
                setPerfil(perfil)
                setAvaliacoes(avaliacoes)
                setDoacoes(doacoes)
            })
            .catch((e) => {
                if (signal.aborted) return
                if (e instanceof ApiError && (e.status === 404 || e.status === 400)) setNaoEncontrado(true)
                else setErro(mensagemDeErro(e))
            })

        return () => controller.abort()
    }, [id])

    if (naoEncontrado || erro || !perfil) {
        return (
            <div className="min-h-screen bg-slate-50 text-seveste-text pb-24">
                <header>
                    <Navbar />
                </header>
                <main className="mx-auto max-w-6xl px-6 pt-12 md:px-12">
                    {naoEncontrado ? (
                        <EmptyState icon={SearchX} titulo="Perfil não encontrado" descricao="Esta pessoa pode ter excluído a conta.">
                            <Link href="/products" className="rounded-lg bg-seveste-dark px-5 py-3 text-sm font-semibold text-white hover:bg-seveste-green">Ver vitrine</Link>
                        </EmptyState>
                    ) : erro ? <ErrorMessage mensagem={erro} /> : <Loading />}
                </main>
            </div>
        )
    }

    const { usuario, estatisticas } = perfil
    const ehDoador = usuario.tipo === "doador"
    const ehMeuPerfil = logado?.id_usuario === usuario.id_usuario
    const avaliacoesVisiveis = mostrarTodas ? avaliacoes : avaliacoes.slice(0, 3)

    return (
        <div className="min-h-screen bg-slate-50 text-seveste-text pb-24">
            <header>
                <Navbar />
            </header>

            <main className="mx-auto max-w-6xl px-6 pt-6 md:px-12 md:pt-10 lg:pt-12">

                {/* Header do Perfil (Capa e Info Principal) */}
                <section className="mb-10 overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-200">
                    {/* Capa */}
                    <div className="h-32 w-full bg-linear-to-r from-seveste-dark to-slate-700 md:h-48 relative">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                    </div>

                    {/* Informações do Usuário */}
                    <div className="relative px-6 pb-8 md:px-10">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between">

                            {/* Avatar e Nome */}
                            <div className="flex flex-col md:flex-row md:items-end gap-5 -mt-12 md:-mt-16 relative z-10">
                                <div className="flex h-24 w-24 md:h-32 md:w-32 items-center justify-center rounded-full border-4 border-white bg-slate-200 text-seveste-muted shadow-md overflow-hidden">
                                    <User className="h-12 w-12 md:h-16 md:w-16" />
                                </div>
                                <div className="mb-2">
                                    <h1 className="flex items-center gap-2 text-3xl font-bold text-seveste-dark md:text-4xl bg-seveste-white/80 rounded">
                                        {usuario.nome}
                                    </h1>
                                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-seveste-muted">
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4" /> {usuario.cidade}, {usuario.uf}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4" /> Membro desde {anoDe(usuario.criado_em)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Ações */}
                            {ehMeuPerfil && (
                                <div className="mt-6 flex gap-3 md:mt-0 md:mb-2">
                                    <Link
                                        href="/dashboard?aba=dados"
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-seveste-dark px-6 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-seveste-green hover:shadow-md md:flex-none"
                                    >
                                        <UserCog className="h-5 w-5" />
                                        Editar perfil
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Bio e Estatísticas */}
                        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                                <h3 className="mb-3 text-lg font-bold text-seveste-dark">Sobre</h3>
                                <p className="whitespace-pre-line leading-relaxed text-seveste-muted">
                                    {usuario.bio || (ehMeuPerfil
                                        ? "Você ainda não escreveu nada sobre você. Adicione uma descrição em \"Editar perfil\"."
                                        : `${usuario.nome} ainda não escreveu uma apresentação.`)}
                                </p>

                                <div className="mt-6 flex flex-wrap gap-3">
                                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-seveste-muted">
                                        <HandHeart className="h-4 w-4" /> {rotuloTipo(usuario.tipo)}
                                    </div>
                                    {estatisticas.doacoes_realizadas >= 5 && (
                                        <div className="flex items-center gap-2 rounded-lg border border-seveste-green/20 bg-seveste-green/5 px-3 py-1.5 text-sm font-medium text-seveste-green">
                                            <Award className="h-4 w-4" /> Doador Frequente
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col justify-center rounded-2xl bg-slate-50 p-6 border border-gray-100">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <span className="block text-3xl font-bold text-seveste-dark">
                                            {ehDoador ? estatisticas.doacoes_realizadas : estatisticas.doacoes_recebidas}
                                        </span>
                                        <span className="text-xs font-medium uppercase tracking-wider text-seveste-muted">
                                            {ehDoador ? "Doações" : "Recebidas"}
                                        </span>
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-3xl font-bold text-seveste-dark">
                                            {estatisticas.total_avaliacoes > 0 ? estatisticas.media_avaliacoes.toFixed(1) : "–"}
                                        </span>
                                        <div className="mt-1 flex justify-center">
                                            <Stars nota={estatisticas.media_avaliacoes} className="h-3 w-3" />
                                        </div>
                                    </div>
                                    <div className="col-span-2 mt-2 flex items-center justify-center gap-2 border-t border-gray-200 pt-4 text-sm text-seveste-muted">
                                        <ThumbsUp className="h-4 w-4" />
                                        {estatisticas.total_avaliacoes} {estatisticas.total_avaliacoes === 1 ? "avaliação recebida" : "avaliações recebidas"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex flex-col gap-10 lg:flex-row lg:items-start">

                    {/* Coluna Principal: Anúncios */}
                    {ehDoador && (
                        <div className="flex-1 w-full">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="flex items-center gap-2 text-2xl font-bold text-seveste-dark">
                                    <Package className="h-6 w-6 text-seveste-green" />
                                    Doações ativas ({doacoes.length})
                                </h2>
                            </div>

                            {doacoes.length === 0 ? (
                                <EmptyState icon={Package} titulo="Nenhuma doação ativa no momento" />
                            ) : (
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {doacoes.map((doacao) => (
                                        <Link
                                            className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-seveste-green hover:shadow-xl"
                                            href={`/products/${doacao.id_doacao}`}
                                            key={doacao.id_doacao}
                                        >
                                            <div className="relative flex aspect-4/3 w-full items-center justify-center overflow-hidden bg-slate-100">
                                                <DonationPhoto
                                                    foto={doacao.fotos[0]}
                                                    alt={doacao.titulo}
                                                    iconClassName="h-10 w-10 transition-transform duration-500 group-hover:scale-125"
                                                />
                                                <div className="absolute left-3 top-3 rounded-full bg-seveste-green px-3 py-1 text-xs font-bold text-white shadow-sm">
                                                    Disponível
                                                </div>
                                            </div>
                                            <div className="p-5">
                                                <h3 className="mb-1 text-lg font-bold text-seveste-dark transition-colors duration-300 group-hover:text-seveste-green truncate">
                                                    {doacao.titulo}
                                                </h3>
                                                <p className="mb-4 text-sm text-seveste-muted">Tamanho {rotuloTamanho(doacao.tamanho)} • {rotuloCondicao(doacao.estado)}</p>
                                                <div className="font-medium text-seveste-dark transition-colors duration-300 group-hover:text-seveste-green text-sm">
                                                    Ver detalhes &rarr;
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Coluna Lateral: Avaliações */}
                    <aside className={`w-full shrink-0 ${ehDoador ? "lg:w-80" : ""}`}>
                        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-seveste-dark">
                            <ThumbsUp className="h-5 w-5 text-seveste-accent" />
                            Avaliações
                        </h2>

                        {avaliacoes.length === 0 ? (
                            <p className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-seveste-muted">
                                Ainda não há avaliações.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {avaliacoesVisiveis.map((review) => (
                                    <div key={review.id_avaliacao} className="rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-seveste-green hover:shadow-md">
                                        <div className="mb-3 flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-seveste-dark font-bold text-sm">
                                                    {(review.autor?.nome ?? "?").charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-seveste-dark">{review.autor?.nome ?? "Usuário removido"}</h4>
                                                    <Stars nota={review.nota} className="h-3 w-3" />
                                                </div>
                                            </div>
                                        </div>
                                        {review.comentario && (
                                            <p className="text-sm leading-relaxed text-seveste-muted">
                                                &ldquo;{review.comentario}&rdquo;
                                            </p>
                                        )}
                                        <span className="mt-3 block text-xs text-slate-400">{tempoRelativo(review.criado_em)}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {avaliacoes.length > 3 && (
                            <button
                                onClick={() => setMostrarTodas(!mostrarTodas)}
                                className="mt-6 w-full rounded-xl border border-gray-300 bg-white py-3 text-sm font-semibold text-seveste-dark transition-all hover:bg-slate-50 hover:text-seveste-green"
                            >
                                {mostrarTodas ? "Mostrar menos" : "Ver todas as avaliações"}
                            </button>
                        )}
                    </aside>

                </div>
            </main>
        </div>
    )
}
