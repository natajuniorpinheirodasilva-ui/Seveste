"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import {
    Bug,
    Home,
    PlusCircle,
    Search,
    User,
    ChartBar,
    Heart,
    X,
    AlertCircleIcon,
    LogIn,
    UserPlus,
    ShieldCheck,
} from "lucide-react"

// O navegador de desenvolvimento fica oculto por padrão.
// Para exibir (ou ocultar) digite o Konami code: ↑ ↑ ↓ ↓ ← → ← → B A
const SEQUENCIA = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"]
const CHAVE_STORAGE = "seveste_dev_navigator"
const EVENTO = "seveste:dev-navigator"

function lerAtivo() {
    try {
        return sessionStorage.getItem(CHAVE_STORAGE) === "1"
    } catch {
        return false
    }
}

function definirAtivo(ativo: boolean) {
    try {
        if (ativo) sessionStorage.setItem(CHAVE_STORAGE, "1")
        else sessionStorage.removeItem(CHAVE_STORAGE)
    } catch {
        // sessionStorage indisponível: o estado vale só até recarregar a página
    }
    window.dispatchEvent(new Event(EVENTO))
}

function assinar(callback: () => void) {
    window.addEventListener(EVENTO, callback)
    return () => window.removeEventListener(EVENTO, callback)
}

const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/login", label: "Login", icon: LogIn },
    { href: "/join", label: "Cadastro", icon: UserPlus },
    { href: "/announce", label: "Anunciar", icon: PlusCircle },
    { href: "/products", label: "Vitrine", icon: Search },
    { href: "/profile", label: "Perfil", icon: User },
    { href: "/dashboard", label: "Dashboard", icon: ChartBar },
    { href: "/success", label: "Doação concluída.", icon: Heart },
    { href: "/privacy-policy", label: "Privacidade", icon: ShieldCheck },
    { href: "/404", label: "404", icon: AlertCircleIcon },
]

export default function DebugNavigator() {
    const ativo = useSyncExternalStore(assinar, lerAtivo, () => false)
    const [isOpen, setIsOpen] = useState(true)

    useEffect(() => {
        let progresso = 0

        const handleKeyDown = (event: KeyboardEvent) => {
            const alvo = event.target as HTMLElement | null
            if (alvo?.closest("input, textarea, select, [contenteditable='true']")) return

            const tecla = event.key.toLowerCase()
            if (tecla === SEQUENCIA[progresso]) {
                progresso++
                if (progresso === SEQUENCIA.length) {
                    progresso = 0
                    setIsOpen(true)
                    definirAtivo(!lerAtivo())
                }
            } else {
                progresso = tecla === SEQUENCIA[0] ? 1 : 0
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [])

    if (!ativo) return null

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
                    {links.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 font-medium transition-all hover:bg-slate-700 hover:text-white"
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                        </Link>
                    ))}

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
