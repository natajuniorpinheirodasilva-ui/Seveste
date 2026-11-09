"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRequireAuth } from "@/components/AuthProvider"
import { ErrorMessage, Loading } from "@/components/Feedback"
import { api, mensagemDeErro } from "@/lib/api"
import type { Solicitacao } from "@/lib/types"
import {
    CheckCircle2,
    Star,
    HeartHandshake,
    Home,
    LayoutDashboard,
    PackageSearch
} from "lucide-react"

export default function SuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ solicitacao?: string | string[] }>
}) {
    const { solicitacao: solicitacaoParam } = use(searchParams)
    const solicitacaoId = typeof solicitacaoParam === "string" && /^\d+$/.test(solicitacaoParam) ? solicitacaoParam : null

    const { usuario, carregando } = useRequireAuth()
    const [solicitacao, setSolicitacao] = useState<Solicitacao | null>(null)
    const [erroCarregamento, setErroCarregamento] = useState<string | null>(null)
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comentario, setComentario] = useState("")
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        if (!usuario || !solicitacaoId) return

        api<{ solicitacao: Solicitacao }>(`/solicitacoes/${solicitacaoId}`)
            .then(({ solicitacao }) => setSolicitacao(solicitacao))
            .catch((e) => setErroCarregamento(mensagemDeErro(e)))
    }, [usuario, solicitacaoId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!solicitacao) return

        setEnviando(true)
        setErro(null)
        try {
            await api("/avaliacoes", {
                method: "POST",
                body: { id_solicitacao: solicitacao.id_solicitacao, nota: rating, comentario },
            })
            setSubmitted(true)
        } catch (e) {
            setErro(mensagemDeErro(e))
            setEnviando(false)
        }
    }

    if (submitted) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-seveste-dark px-6 text-white text-center">
                <HeartHandshake className="mb-6 h-20 w-20 text-seveste-green animate-bounce" />
                <h1 className="mb-4 text-3xl font-bold md:text-5xl">Muito obrigado!</h1>
                <p className="mb-8 max-w-md text-slate-300 leading-relaxed">
                    Sua avaliação ajuda a manter a comunidade da Seveste segura e confiável para todos.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Link
                        href="/dashboard"
                        className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-6 py-3.5 font-semibold transition-colors hover:bg-slate-700"
                    >
                        <LayoutDashboard className="h-5 w-5" />
                        Ir para Dashboard
                    </Link>
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 rounded-xl bg-seveste-green px-6 py-3.5 font-semibold text-white transition-colors hover:bg-emerald-600"
                    >
                        <Home className="h-5 w-5" />
                        Voltar ao Início
                    </Link>
                </div>
            </div>
        )
    }

    // sem solicitação válida na URL, ou ainda carregando
    if (!solicitacaoId || erroCarregamento || carregando || !usuario || !solicitacao) {
        const semDados = !solicitacaoId || erroCarregamento
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-12 text-center">
                {semDados ? (
                    <>
                        <PackageSearch className="mb-6 h-16 w-16 text-seveste-muted" />
                        <h1 className="mb-3 text-2xl font-bold text-seveste-dark">Nenhuma doação selecionada</h1>
                        <p className="mb-8 max-w-md text-seveste-muted">{erroCarregamento ?? "Conclua uma doação pela sua conta para avaliá-la."}</p>
                        <Link href="/dashboard" className="rounded-xl bg-seveste-dark px-6 py-3.5 font-semibold text-white hover:bg-seveste-green">
                            Ir para Minha Conta
                        </Link>
                    </>
                ) : (
                    <Loading />
                )}
            </div>
        )
    }

    const souDoador = usuario.id_usuario === solicitacao.doador?.id_usuario
    const outraParte = souDoador ? solicitacao.solicitante : solicitacao.doador
    const concluida = solicitacao.status === "ACEITA"

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-12">

            <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">

                {/* Header Celebrativo */}
                <div className="bg-seveste-green/10 px-8 py-10 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-seveste-green text-white shadow-lg">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-seveste-dark md:text-3xl">
                        {souDoador ? "Doação concluída!" : "Doação recebida!"}
                    </h1>
                    <p className="mt-2 text-seveste-muted">
                        {souDoador
                            ? "Você fez a diferença na vida de alguém hoje."
                            : `Que bom que "${solicitacao.doacao?.titulo ?? "a peça"}" encontrou você.`}
                    </p>
                </div>

                {/* Formulário de Avaliação */}
                <div className="p-8 md:p-10">
                    {!concluida ? (
                        <p className="text-center text-seveste-muted">Esta doação ainda não foi concluída, então não pode ser avaliada.</p>
                    ) : solicitacao.avaliada_por_mim ? (
                        <div className="flex flex-col items-center text-center">
                            <p className="mb-6 text-seveste-muted">Você já avaliou esta doação. Obrigado por contribuir com a comunidade!</p>
                            <Link href="/dashboard" className="rounded-xl bg-seveste-dark px-6 py-3.5 font-semibold text-white hover:bg-seveste-green">
                                Ir para Minha Conta
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h2 className="mb-6 text-center text-lg font-bold text-seveste-dark">
                                Como foi sua experiência com {outraParte?.nome ?? "a outra pessoa"}?
                            </h2>

                            <form onSubmit={handleSubmit} className="flex flex-col items-center">

                                {/* Estrelas Interativas */}
                                <div className="mb-8 flex gap-2" role="radiogroup" aria-label="Nota">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            role="radio"
                                            aria-checked={rating === star}
                                            aria-label={`${star} ${star === 1 ? "estrela" : "estrelas"}`}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <Star
                                                className={`h-10 w-10 transition-colors ${star <= (hoverRating || rating)
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-300"
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>

                                <div className="w-full mb-8">
                                    <label htmlFor="feedback" className="mb-2 block text-sm font-medium text-seveste-dark">
                                        Deixe um comentário (opcional)
                                    </label>
                                    <textarea
                                        id="feedback"
                                        rows={3}
                                        maxLength={500}
                                        value={comentario}
                                        onChange={(e) => setComentario(e.target.value)}
                                        placeholder="A pessoa foi pontual? Foi educada? Conta pra gente..."
                                        className="w-full resize-none rounded-xl border border-gray-300 bg-slate-50 px-4 py-3 text-sm outline-none transition-colors focus:border-seveste-green focus:bg-white focus:ring-1 focus:ring-seveste-green"
                                    ></textarea>
                                    <p className="mt-1 text-xs text-seveste-muted">O comentário ficará visível no perfil público da pessoa avaliada.</p>
                                </div>

                                {erro && <div className="mb-4 w-full"><ErrorMessage mensagem={erro} /></div>}

                                <button
                                    type="submit"
                                    disabled={rating === 0 || enviando}
                                    className="w-full rounded-xl bg-seveste-dark px-6 py-4 font-semibold text-white transition-all hover:-translate-y-1 hover:bg-seveste-green hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-seveste-dark disabled:hover:shadow-none"
                                >
                                    {enviando ? "Enviando..." : "Enviar avaliação"}
                                </button>

                                <Link href="/dashboard" className="mt-4 text-sm font-medium text-seveste-muted hover:text-seveste-dark underline-offset-4 hover:underline">
                                    Pular esta etapa
                                </Link>
                            </form>
                        </>
                    )}
                </div>
            </div>

        </div>
    )
}
