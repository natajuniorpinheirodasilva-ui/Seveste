"use client"

import { useState } from "react"
import Link from "next/link"
import {
    CheckCircle2,
    Star,
    HeartHandshake,
    Home,
    LayoutDashboard
} from "lucide-react"

export default function SuccessPage() {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitted(true)
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

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-12">

            <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">

                {/* Header Celebrativo */}
                <div className="bg-seveste-green/10 px-8 py-10 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-seveste-green text-white shadow-lg">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-seveste-dark md:text-3xl">Doação concluída!</h1>
                    <p className="mt-2 text-seveste-muted">Você fez a diferença na vida de alguém hoje.</p>
                </div>

                {/* Formulário de Avaliação */}
                <div className="p-8 md:p-10">
                    <h2 className="mb-6 text-center text-lg font-bold text-seveste-dark">
                        Como foi sua experiência com Carlos Souza?
                    </h2>

                    <form onSubmit={handleSubmit} className="flex flex-col items-center">

                        {/* Estrelas Interativas */}
                        <div className="mb-8 flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
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
                                placeholder="A pessoa foi pontual? Foi educada? Conta pra gente..."
                                className="w-full resize-none rounded-xl border border-gray-300 bg-slate-50 px-4 py-3 text-sm outline-none transition-colors focus:border-seveste-green focus:bg-white focus:ring-1 focus:ring-seveste-green"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={rating === 0}
                            className="w-full rounded-xl bg-seveste-dark px-6 py-4 font-semibold text-white transition-all hover:-translate-y-1 hover:bg-seveste-green hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-seveste-dark disabled:hover:shadow-none"
                        >
                            Enviar avaliação
                        </button>

                        <Link href="/dashboard" className="mt-4 text-sm font-medium text-seveste-muted hover:text-seveste-dark underline-offset-4 hover:underline">
                            Pular esta etapa
                        </Link>
                    </form>
                </div>
            </div>

        </div>
    )
}