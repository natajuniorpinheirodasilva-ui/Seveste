"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useRequireAuth } from "@/components/AuthProvider"
import { Loading } from "@/components/Feedback"

// "/profile" leva ao perfil público de quem está logado
export default function MyProfileRedirect() {
    const { usuario } = useRequireAuth()
    const router = useRouter()

    useEffect(() => {
        if (usuario) router.replace(`/profile/${usuario.id_usuario}`)
    }, [usuario, router])

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
            <Loading />
        </main>
    )
}
