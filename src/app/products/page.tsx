"use client"

import { use, useEffect, useState } from "react"
import Navbar from "@/components/Navbar"
import DonationPhoto from "@/components/DonationPhoto"
import { EmptyState, ErrorMessage, Loading } from "@/components/Feedback"
import Link from "next/link"
import { api, mensagemDeErro } from "@/lib/api"
import { CATEGORIAS, CONDICOES, TAMANHOS_LETRA, UFS, rotuloCategoria, rotuloCondicao, rotuloTamanho } from "@/lib/constants"
import { localizacao } from "@/lib/format"
import type { Doacao } from "@/lib/types"
import {
    Search,
    SlidersHorizontal,
    MapPin,
    Tag,
    ArrowRight,
    X,
    Check,
    PackageSearch
} from "lucide-react"

type Filtros = {
    condicoes: string[]
    tamanhos: string[]
    uf: string
    cidade: string
}

const FILTROS_VAZIOS: Filtros = { condicoes: [], tamanhos: [], uf: "", cidade: "" }

function alternar(lista: string[], valor: string) {
    return lista.includes(valor) ? lista.filter((item) => item !== valor) : [...lista, valor]
}

export default function Products({
    searchParams,
}: {
    searchParams: Promise<{ cat?: string | string[] }>
}) {
    const { cat } = use(searchParams)
    const categoriaInicial = typeof cat === "string" && CATEGORIAS.some(({ valor }) => valor === cat) ? cat : ""

    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [categoria, setCategoria] = useState(categoriaInicial)
    const [busca, setBusca] = useState("")
    const [buscaAplicada, setBuscaAplicada] = useState("")
    // filtros em edição no painel e filtros já aplicados à busca
    const [rascunho, setRascunho] = useState<Filtros>(FILTROS_VAZIOS)
    const [filtros, setFiltros] = useState<Filtros>(FILTROS_VAZIOS)

    // resultado da última busca, identificado pela query que o gerou
    const [resultado, setResultado] = useState<{ query: string; doacoes: Doacao[]; erro: string | null } | null>(null)

    // Previne a rolagem da página quando o modal estiver aberto
    useEffect(() => {
        if (isFilterOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
    }, [isFilterOpen])

    // espera o usuário parar de digitar antes de buscar
    useEffect(() => {
        const timer = setTimeout(() => setBuscaAplicada(busca.trim()), 350)
        return () => clearTimeout(timer)
    }, [busca])

    const params = new URLSearchParams()
    if (categoria) params.set("categoria", categoria)
    if (buscaAplicada) params.set("busca", buscaAplicada)
    if (filtros.condicoes.length) params.set("estado", filtros.condicoes.join(","))
    if (filtros.tamanhos.length) params.set("tamanho", filtros.tamanhos.join(","))
    if (filtros.uf) params.set("uf", filtros.uf)
    if (filtros.cidade.trim()) params.set("cidade", filtros.cidade.trim())
    const query = params.toString()

    useEffect(() => {
        const controller = new AbortController()

        api<{ doacoes: Doacao[] }>(`/doacoes?${query}`, { signal: controller.signal })
            .then(({ doacoes }) => setResultado({ query, doacoes, erro: null }))
            .catch((e) => {
                if (!controller.signal.aborted) setResultado({ query, doacoes: [], erro: mensagemDeErro(e) })
            })

        return () => controller.abort()
    }, [query])

    const carregando = resultado?.query !== query
    const doacoes = resultado?.doacoes ?? []
    const erro = carregando ? null : resultado?.erro ?? null

    const totalFiltros = filtros.condicoes.length + filtros.tamanhos.length + (filtros.uf ? 1 : 0) + (filtros.cidade.trim() ? 1 : 0)

    const abrirFiltros = () => {
        setRascunho(filtros)
        setIsFilterOpen(true)
    }

    const aplicarFiltros = () => {
        setFiltros(rascunho)
        setIsFilterOpen(false)
    }

    return (
        <div className="min-h-screen bg-slate-50 text-seveste-text">
            <header>
                <Navbar />
            </header>

            <main className="mx-auto max-w-7xl px-6 py-12 md:px-12 lg:py-16">
                <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Vitrine de doações</h1>
                        <p className="mt-2 text-seveste-muted">
                            Explore as peças disponíveis e encontre o que você precisa.
                        </p>
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
                        <div className="group relative flex w-full items-center md:w-80">
                            <Search className="absolute left-4 h-5 w-5 text-seveste-muted transition-colors duration-300 group-focus-within:text-seveste-green" />
                            <input
                                type="search"
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                placeholder="Buscar peças..."
                                aria-label="Buscar peças"
                                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm outline-none transition-all duration-300 hover:border-seveste-green focus:border-seveste-green focus:ring-1 focus:ring-seveste-green"
                            />
                        </div>
                        <button
                            onClick={abrirFiltros}
                            className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium transition-all duration-300 hover:border-seveste-dark hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-seveste-dark focus:ring-offset-1"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            Filtros
                            {totalFiltros > 0 && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-seveste-green text-[10px] font-bold text-white">
                                    {totalFiltros}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                <div className="mb-10 flex flex-wrap gap-2">
                    {[{ valor: "", rotulo: "Todas" }, ...CATEGORIAS].map(({ valor, rotulo }) => (
                        <button
                            key={rotulo}
                            onClick={() => setCategoria(valor)}
                            aria-pressed={categoria === valor}
                            className={`rounded-full border px-5 py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 ${categoria === valor
                                ? "border-seveste-dark bg-seveste-dark text-white"
                                : "border-gray-200 bg-white text-seveste-muted hover:border-seveste-green hover:bg-seveste-green/5 hover:text-seveste-dark"
                                }`}
                        >
                            {rotulo}
                        </button>
                    ))}
                </div>

                {erro && <ErrorMessage mensagem={erro} />}

                {!erro && carregando && <Loading texto="Buscando doações..." />}

                {!erro && !carregando && doacoes.length === 0 && (
                    <EmptyState
                        icon={PackageSearch}
                        titulo="Nenhuma peça encontrada"
                        descricao="Tente buscar por outro termo ou remover alguns filtros."
                    />
                )}

                {!erro && !carregando && doacoes.length > 0 && (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
                        {doacoes.map((doacao) => (
                            <Link
                                href={`/products/${doacao.id_doacao}`}
                                key={doacao.id_doacao}
                                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-seveste-green hover:shadow-xl"
                            >
                                <div className="relative flex aspect-4/3 w-full items-center justify-center overflow-hidden bg-slate-100">
                                    <DonationPhoto
                                        foto={doacao.fotos[0]}
                                        alt={doacao.titulo}
                                        iconClassName="h-10 w-10 transition-transform duration-500 group-hover:scale-125"
                                        imageClassName="transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-seveste-dark shadow-sm backdrop-blur-sm">
                                        {rotuloCategoria(doacao.categoria)}
                                    </div>
                                </div>

                                <div className="flex flex-1 flex-col p-5">
                                    <h3 className="mb-2 text-lg font-bold text-seveste-dark transition-colors duration-300 group-hover:text-seveste-green">
                                        {doacao.titulo}
                                    </h3>

                                    <div className="mb-4 flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-sm text-seveste-muted">
                                            <Tag className="h-4 w-4 shrink-0" />
                                            <span>{rotuloTamanho(doacao.tamanho)} / {rotuloCondicao(doacao.estado)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-seveste-muted">
                                            <MapPin className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{localizacao(doacao.cidade, doacao.uf, doacao.local)}</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto border-t border-gray-100 pt-4">
                                        <div className="flex items-center justify-between font-medium text-seveste-dark transition-colors duration-300 group-hover:text-seveste-green">
                                            <span className="text-sm">Ver detalhes</span>
                                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            {/* Overlay Escuro */}
            <div
                className={`fixed inset-0 z-40 bg-seveste-dark/40 backdrop-blur-sm transition-opacity duration-300 ${isFilterOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onClick={() => setIsFilterOpen(false)}
            />

            {/* Painel Lateral de Filtros */}
            <div className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                    <h2 className="text-xl font-bold text-seveste-dark">Filtros</h2>
                    <button
                        onClick={() => setIsFilterOpen(false)}
                        className="group rounded-full bg-slate-100 p-2 transition-colors hover:bg-slate-200"
                        aria-label="Fechar filtros"
                    >
                        <X className="h-5 w-5 text-seveste-muted transition-colors group-hover:text-seveste-dark" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

                    <div>
                        <h3 className="mb-4 font-semibold text-seveste-dark">Condição da peça</h3>
                        <div className="flex flex-col gap-3">
                            {CONDICOES.map(({ valor, rotulo }) => (
                                <label key={valor} className="group flex cursor-pointer items-center gap-3">
                                    <div className="relative flex h-5 w-5 items-center justify-center rounded border border-gray-300 transition-colors group-hover:border-seveste-green has-checked:border-seveste-green has-checked:bg-seveste-green">
                                        <input
                                            type="checkbox"
                                            className="peer sr-only"
                                            checked={rascunho.condicoes.includes(valor)}
                                            onChange={() => setRascunho({ ...rascunho, condicoes: alternar(rascunho.condicoes, valor) })}
                                        />
                                        <Check className="h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                                    </div>
                                    <span className="text-sm text-seveste-muted transition-colors group-hover:text-seveste-dark">{rotulo}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold text-seveste-dark">Tamanho</h3>
                        <div className="flex flex-wrap gap-2">
                            {TAMANHOS_LETRA.map(({ valor, rotulo }) => (
                                <label key={valor} className="cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        checked={rascunho.tamanhos.includes(valor)}
                                        onChange={() => setRascunho({ ...rascunho, tamanhos: alternar(rascunho.tamanhos, valor) })}
                                    />
                                    <div className="flex h-10 min-w-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-2 text-sm font-medium text-seveste-muted transition-all hover:border-seveste-green hover:bg-seveste-green/5 peer-checked:border-seveste-green peer-checked:bg-seveste-green peer-checked:text-white">
                                        {rotulo}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold text-seveste-dark">Região</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <label className="col-span-1 flex flex-col gap-1.5 text-sm text-seveste-muted">
                                Estado
                                <select
                                    value={rascunho.uf}
                                    onChange={(e) => setRascunho({ ...rascunho, uf: e.target.value })}
                                    className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base text-seveste-text outline-none transition-colors duration-200 hover:border-seveste-green focus:border-seveste-green focus:ring-1 focus:ring-seveste-green"
                                >
                                    <option value="">Todos</option>
                                    {UFS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                                </select>
                            </label>
                            <label className="col-span-2 flex flex-col gap-1.5 text-sm text-seveste-muted">
                                Cidade
                                <input
                                    type="text"
                                    value={rascunho.cidade}
                                    onChange={(e) => setRascunho({ ...rascunho, cidade: e.target.value })}
                                    placeholder="Ex.: Botucatu"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base text-seveste-text outline-none transition-colors duration-200 hover:border-seveste-green focus:border-seveste-green focus:ring-1 focus:ring-seveste-green"
                                />
                            </label>
                        </div>
                    </div>

                </div>

                <div className="flex gap-3 border-t border-gray-100 bg-slate-50 p-6">
                    <button
                        onClick={() => setRascunho(FILTROS_VAZIOS)}
                        className="rounded-lg border border-gray-300 bg-white px-5 py-3.5 font-sans text-sm font-semibold text-seveste-dark transition-colors hover:bg-slate-100"
                    >
                        Limpar
                    </button>
                    <button
                        onClick={aplicarFiltros}
                        className="flex-1 rounded-lg bg-seveste-dark px-6 py-3.5 text-center font-sans text-base font-semibold tracking-wide text-white transition-all hover:-translate-y-1 hover:bg-seveste-green hover:shadow-lg"
                    >
                        Mostrar resultados
                    </button>
                </div>
            </div>
        </div>
    )
}
