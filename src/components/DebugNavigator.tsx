"use client"

import { useState } from "react"
import Link from "next/link"
import { Bug, Home, PlusCircle, Search, Package, User, ChartBar, Heart, X, AlertCircleIcon } from "lucide-react"

export default function DebugNavigator() {
    const [isOpen, setIsOpen] = useState(true)

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="group fixed bottom-4 left-4 z-100 flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-amber-400 shadow-xl transition-all duration-300 hover:scale-110 hover:border-amber-400 hover:bg-slate-800"
                aria-label="Abrir navegador de debug"
            >
                <Bug className="h-6 w-6 transition-transform group-hover:animate-bounce" />
            </button>
        )
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-100 border-t border-slate-700 bg-slate-900/95 p-3 text-xs text-slate-200 backdrop-blur-md transition-all duration-300">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row px-4">
                <div className="flex items-center gap-2 font-mono font-bold text-amber-400">
                    <Bug className="h-4 w-4" />
                    <span>DEV_NAVIGATOR</span>
                </div>

                <nav className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 font-medium transition-all hover:bg-slate-700 hover:text-white"
                    >
                        <Home className="h-3.5 w-3.5" />
                        Home
                    </Link>

                    <Link
                        href="/announce"
                        className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 font-medium transition-all hover:bg-slate-700 hover:text-white"
                    >
                        <PlusCircle className="h-3.5 w-3.5" />
                        Anunciar
                    </Link>

                    <Link
                        href="/products"
                        className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 font-medium transition-all hover:bg-slate-700 hover:text-white"
                    >
                        <Search className="h-3.5 w-3.5" />
                        Vitrine
                    </Link>

                    <Link
                        href="/products/1"
                        className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 font-medium transition-all hover:bg-slate-700 hover:text-white"
                    >
                        <Package className="h-3.5 w-3.5" />
                        Produto (Detalhe)
                    </Link>

                    <Link
                        className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 font-medium transition-all hover:bg-slate-700 hover:text-white"
                        href="/profile"
                    >
                        <User className="h-3.5 w-3.5" />
                        Perfil
                    </Link>

                    <Link
                        className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 font-medium transition-all hover:bg-slate-700 hover:text-white"
                        href="/dashboard"
                    >
                        <ChartBar className="h-3.5 w-3.5" />
                        Dashboard
                    </Link>

                    <Link
                        className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 font-medium transition-all hover:bg-slate-700 hover:text-white"
                        href="/success"
                    >
                        <Heart className="h-3.5 w-3.5" />
                        Doação concluída.
                    </Link>

                    <Link
                        className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 font-medium transition-all hover:bg-slate-700 hover:text-white"
                        href="/404"
                    >
                        <AlertCircleIcon className="h-3.5 w-3.5" />
                        404
                    </Link>

                    <div className="ml-2 h-6 w-px bg-slate-700 hidden sm:block"></div>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center rounded-md bg-red-500/10 p-1.5 text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
                        aria-label="Fechar navegador"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </nav>
            </div>
        </div>
    )
}