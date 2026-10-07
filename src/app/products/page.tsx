"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"
import Link from "next/link"
import {
    Search,
    SlidersHorizontal,
    MapPin,
    Tag,
    Image as ImageIcon,
    ArrowRight,
    X,
    Check
} from "lucide-react"

export default function Products() {
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const layoutItems = Array.from({ length: 8 })

    // Previne a rolagem da página quando o modal estiver aberto
    useEffect(() => {
        if (isFilterOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
    }, [isFilterOpen])

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
                                type="text"
                                placeholder="Buscar peças..."
                                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm outline-none transition-all duration-300 hover:border-seveste-green focus:border-seveste-green focus:ring-1 focus:ring-seveste-green"
                            />
                        </div>
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium transition-all duration-300 hover:border-seveste-dark hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-seveste-dark focus:ring-offset-1"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            Filtros
                        </button>
                    </div>
                </div>

                <div className="mb-10 flex flex-wrap gap-2">
                    {['Todas', 'Roupas', 'Agasalhos', 'Calçados', 'Acessórios', 'Infantil'].map((category, index) => (
                        <button
                            key={index}
                            className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-seveste-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-seveste-green hover:bg-seveste-green/5 hover:text-seveste-dark focus:bg-seveste-dark focus:text-white"
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
                    {layoutItems.map((_, index) => (
                        <Link
                            href={`/products/${index}`}
                            key={index}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-seveste-green hover:shadow-xl"
                        >
                            <div className="relative flex aspect-4/3 w-full items-center justify-center overflow-hidden bg-slate-100">
                                <ImageIcon className="h-10 w-10 text-slate-300 transition-transform duration-500 group-hover:scale-125" />
                                <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-seveste-dark shadow-sm backdrop-blur-sm">
                                    Categoria
                                </div>
                            </div>

                            <div className="flex flex-1 flex-col p-5">
                                <h3 className="mb-2 text-lg font-bold text-seveste-dark transition-colors duration-300 group-hover:text-seveste-green">
                                    Título da peça
                                </h3>

                                <div className="mb-4 flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-sm text-seveste-muted">
                                        <Tag className="h-4 w-4 shrink-0" />
                                        <span>Tamanho / Condição</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-seveste-muted">
                                        <MapPin className="h-4 w-4 shrink-0" />
                                        <span className="truncate">Localização aproximada</span>
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
                    >
                        <X className="h-5 w-5 text-seveste-muted transition-colors group-hover:text-seveste-dark" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

                    <div>
                        <h3 className="mb-4 font-semibold text-seveste-dark">Condição da peça</h3>
                        <div className="flex flex-col gap-3">
                            {['Novo (com etiqueta)', 'Usado (excelente)', 'Usado (com marcas)'].map((cond, i) => (
                                <label key={i} className="group flex cursor-pointer items-center gap-3">
                                    <div className="relative flex h-5 w-5 items-center justify-center rounded border border-gray-300 transition-colors group-hover:border-seveste-green has-checked:border-seveste-green has-checked:bg-seveste-green">
                                        <input type="checkbox" className="peer sr-only" />
                                        <Check className="h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                                    </div>
                                    <span className="text-sm text-seveste-muted transition-colors group-hover:text-seveste-dark">{cond}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold text-seveste-dark">Tamanho</h3>
                        <div className="flex flex-wrap gap-2">
                            {['PP', 'P', 'M', 'G', 'GG', 'Único'].map((size, i) => (
                                <label key={i} className="cursor-pointer">
                                    <input type="checkbox" className="peer sr-only" />
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-medium text-seveste-muted transition-all hover:border-seveste-green hover:bg-seveste-green/5 peer-checked:border-seveste-green peer-checked:bg-seveste-green peer-checked:text-white">
                                        {size}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-4 font-semibold text-seveste-dark">Distância máxima</h3>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            defaultValue="15"
                            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-seveste-green"
                        />
                        <div className="mt-2 flex justify-between text-xs text-seveste-muted">
                            <span>1 km</span>
                            <span className="font-medium text-seveste-dark">15 km</span>
                            <span>50 km</span>
                        </div>
                    </div>

                </div>

                <div className="border-t border-gray-100 bg-slate-50 p-6">
                    <button
                        onClick={() => setIsFilterOpen(false)}
                        className="w-full rounded-lg bg-seveste-dark px-6 py-3.5 text-center font-sans text-base font-semibold tracking-wide text-white transition-all hover:-translate-y-1 hover:bg-seveste-green hover:shadow-lg"
                    >
                        Mostrar resultados
                    </button>
                </div>
            </div>
        </div>
    )
}