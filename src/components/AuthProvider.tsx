"use client"

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { api } from "@/lib/api"
import type { TipoUsuario, Usuario } from "@/lib/types"

type AuthContextValue = {
    usuario: Usuario | null
    carregando: boolean
    entrar: (email: string, senha: string) => Promise<Usuario>
    sair: () => Promise<void>
    definirUsuario: (usuario: Usuario | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [usuario, setUsuario] = useState<Usuario | null>(null)
    const [carregando, setCarregando] = useState(true)

    // a sessão fica em um cookie httpOnly; aqui só descobrimos quem está logado
    useEffect(() => {
        api<{ usuario: Usuario }>("/usuarios/me")
            .then(({ usuario }) => setUsuario(usuario))
            .catch(() => setUsuario(null))
            .finally(() => setCarregando(false))
    }, [])

    const entrar = useCallback(async (email: string, senha: string) => {
        const { usuario } = await api<{ usuario: Usuario }>("/login", {
            method: "POST",
            body: { email, senha },
        })
        setUsuario(usuario)
        return usuario
    }, [])

    const sair = useCallback(async () => {
        await api("/logout", { method: "POST" }).catch(() => undefined)
        setUsuario(null)
    }, [])

    return (
        <AuthContext.Provider value={{ usuario, carregando, entrar, sair, definirUsuario: setUsuario }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const contexto = useContext(AuthContext)
    if (!contexto) throw new Error("useAuth deve ser usado dentro de <AuthProvider>")
    return contexto
}

// Redireciona para o login quando não houver sessão (e, opcionalmente, quando o tipo de usuário não for o esperado)
export function useRequireAuth(tipo?: TipoUsuario) {
    const { usuario, carregando } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (carregando) return

        if (!usuario) {
            const destino = typeof window !== "undefined" ? window.location.pathname + window.location.search : pathname
            router.replace(`/login?next=${encodeURIComponent(destino)}`)
        } else if (tipo && usuario.tipo !== tipo) {
            router.replace("/dashboard")
        }
    }, [carregando, usuario, tipo, router, pathname])

    const autorizado = !carregando && !!usuario && (!tipo || usuario.tipo === tipo)
    return { usuario: autorizado ? usuario : null, carregando: !autorizado }
}
