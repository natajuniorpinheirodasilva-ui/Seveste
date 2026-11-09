"use client"

import { useAuth } from "@/components/AuthProvider"
import { ErrorMessage } from "@/components/Feedback"
import Input from "@/components/Input"
import { mensagemDeErro } from "@/lib/api"
import { ArrowLeft, LogIn } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { use, useEffect, useState, type FormEvent } from "react"

// aceita apenas caminhos internos para evitar redirecionamentos para outros sites
function destinoSeguro(next?: string | string[]) {
    const destino = Array.isArray(next) ? next[0] : next
    return destino && destino.startsWith("/") && !destino.startsWith("//") ? destino : null
}

export default function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ next?: string | string[] }>
}) {
    const { next } = use(searchParams)
    const { usuario, entrar } = useAuth()
    const router = useRouter()
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    const redirecionar = (tipo: string) => {
        router.replace(destinoSeguro(next) ?? (tipo === "doador" ? "/dashboard" : "/products"))
    }

    useEffect(() => {
        if (usuario && !enviando) {
            router.replace(destinoSeguro(next) ?? "/dashboard")
        }
    }, [usuario, enviando, next, router])

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const dados = new FormData(event.currentTarget)

        setEnviando(true)
        setErro(null)

        try {
            const logado = await entrar(String(dados.get("email")), String(dados.get("password")))
            redirecionar(logado.tipo)
        } catch (e) {
            setErro(mensagemDeErro(e))
            setEnviando(false)
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-seveste-cream px-4 py-10 sm:px-6">
            <section className="mx-auto w-full max-w-md border border-seveste-sage/30 bg-seveste-white p-6 shadow-[0_24px_70px_rgba(23,63,53,0.12)] sm:p-10">
                <Link
                    href="/"
                    className="mb-8 flex w-fit items-center gap-2 text-sm font-medium text-seveste-muted transition hover:text-seveste-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-seveste-green"
                >
                    <ArrowLeft size={18} />
                    Voltar
                </Link>

                <div className="mb-8 flex items-start gap-4">
                    <span className="bg-seveste-dark p-3 text-seveste-white">
                        <LogIn size={28} />
                    </span>
                    <div>
                        <p className="mb-1 text-sm font-semibold uppercase tracking-[0.2em] text-seveste-accent">
                            Bem-vindo de volta
                        </p>
                        <h1 className="text-3xl font-semibold text-seveste-dark">
                            Entrar
                        </h1>
                        <p className="mt-2 text-base text-seveste-muted">
                            Acesse sua conta para anunciar, solicitar e conversar.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-5">
                    <Input
                        label="E-mail"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="voce@exemplo.com"
                        required
                    />
                    <Input
                        label="Senha"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Sua senha"
                        required
                    />

                    {erro && <ErrorMessage mensagem={erro} />}

                    <button
                        type="submit"
                        disabled={enviando}
                        className="mt-2 cursor-pointer border border-seveste-green bg-seveste-green px-6 py-3 font-semibold text-seveste-white shadow-sm transition duration-200 hover:-translate-y-px hover:border-seveste-dark hover:bg-seveste-dark hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seveste-green disabled:cursor-wait disabled:opacity-60"
                    >
                        {enviando ? "Entrando..." : "Entrar"}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-seveste-muted">
                    Ainda não tem conta?{" "}
                    <Link href="/join" className="font-semibold text-seveste-green underline-offset-4 hover:text-seveste-dark hover:underline">
                        Cadastre-se
                    </Link>
                </p>
            </section>
        </main>
    )
}
