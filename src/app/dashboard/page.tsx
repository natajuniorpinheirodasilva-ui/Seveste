"use client"

import { useState } from "react"
import Navbar from "@/components/Navbar"
import Link from "next/link"
import {
    Package,
    Heart,
    History,
    Edit3,
    Trash2,
    CheckCircle2,
    Image as ImageIcon,
    MapPin,
    ArrowRight
} from "lucide-react"

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("ativos")

    return (
        <div className="min-h-screen bg-slate-50 text-seveste-text pb-20">
            <header>
                <Navbar />
            </header>

            <main className="mx-auto max-w-6xl px-6 py-8 md:px-12 lg:py-12">

                <div className="mb-10">
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Minha Conta</h1>
                    <p className="mt-2 text-seveste-muted">
                        Gerencie seus anúncios, favoritos e histórico de doações.
                    </p>
                </div>

                {/* Navegação de Abas */}
                <div className="mb-8 flex overflow-x-auto border-b border-gray-200 hide-scrollbar">
                    <button
                        onClick={() => setActiveTab("ativos")}
                        className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === "ativos"
                            ? "border-seveste-green text-seveste-green"
                            : "border-transparent text-seveste-muted hover:text-seveste-dark"
                            }`}
                    >
                        <Package className="h-4 w-4" />
                        Anúncios Ativos (2)
                    </button>
                    <button
                        onClick={() => setActiveTab("historico")}
                        className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === "historico"
                            ? "border-seveste-green text-seveste-green"
                            : "border-transparent text-seveste-muted hover:text-seveste-dark"
                            }`}
                    >
                        <History className="h-4 w-4" />
                        Histórico
                    </button>
                    <button
                        onClick={() => setActiveTab("salvos")}
                        className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === "salvos"
                            ? "border-seveste-green text-seveste-green"
                            : "border-transparent text-seveste-muted hover:text-seveste-dark"
                            }`}
                    >
                        <Heart className="h-4 w-4" />
                        Itens Salvos
                    </button>
                </div>

                {/* Conteúdo das Abas */}
                <div className="min-h-[40vh]">

                    {/* ABA: ATIVOS */}
                    {activeTab === "ativos" && (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {[1, 2].map((item) => (
                                <div key={item} className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
                                    <div className="relative flex aspect-video w-full items-center justify-center bg-slate-100">
                                        <ImageIcon className="h-8 w-8 text-slate-300" />
                                        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700">
                                            3 interessados
                                        </div>
                                    </div>
                                    <div className="flex flex-1 flex-col p-5">
                                        <h3 className="mb-1 font-bold text-seveste-dark">
                                            {item === 1 ? "Casaco de Lã Azul" : "Tênis Infantil Tam 28"}
                                        </h3>
                                        <p className="mb-4 text-sm text-seveste-muted">Publicado há 2 dias</p>

                                        <div className="mt-auto flex flex-col gap-2 border-t border-gray-100 pt-4">
                                            <Link
                                                href="/success"
                                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-seveste-green px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                                Concluir doação
                                            </Link>
                                            <div className="flex gap-2">
                                                <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-seveste-dark transition-colors hover:bg-slate-50">
                                                    <Edit3 className="h-3.5 w-3.5" /> Editar
                                                </button>
                                                <button className="flex items-center justify-center rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-red-600 transition-colors hover:bg-red-100">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ABA: HISTÓRICO */}
                    {activeTab === "historico" && (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map((item) => (
                                <div key={item} className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                                        <ImageIcon className="h-6 w-6 text-slate-300" />
                                    </div>
                                    <div className="flex-1 text-center sm:text-left">
                                        <h4 className="font-bold text-seveste-dark">Calça Jeans Feminina</h4>
                                        <p className="text-sm text-seveste-muted">Doado para Carlos Souza em 12/08/2023</p>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-sm font-medium text-seveste-dark border border-gray-200">
                                        Finalizado
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ABA: SALVOS */}
                    {activeTab === "salvos" && (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {[1, 2].map((item) => (
                                <Link href={`/product/${item}`} key={item} className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-seveste-green">
                                    <div className="relative flex aspect-4/3 w-full items-center justify-center bg-slate-100">
                                        <ImageIcon className="h-8 w-8 text-slate-300 transition-transform group-hover:scale-110" />
                                        <button className="absolute right-3 top-3 text-red-500">
                                            <Heart className="h-5 w-5 fill-current" />
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="mb-1 font-bold text-seveste-dark group-hover:text-seveste-green">Jaqueta Corta Vento</h3>
                                        <div className="flex items-center gap-1.5 text-xs text-seveste-muted">
                                            <MapPin className="h-3 w-3" /> Pinheiros, SP
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                </div>
            </main>
        </div>
    )
}