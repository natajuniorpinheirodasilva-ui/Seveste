"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"
import { api, mensagemDeErro } from "./api"
import type { TipoUsuario, Usuario } from "./types"

type CamposExtras = (dados: FormData) => Record<string, unknown> | string

// Envia o cadastro para a API. "camposExtras" pode devolver uma mensagem (string) para barrar o envio.
export function useSignup(tipo: TipoUsuario, camposExtras?: CamposExtras) {
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const { definirUsuario } = useAuth()
    const router = useRouter()

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const dados = new FormData(event.currentTarget)

        const extras = camposExtras?.(dados) ?? {}
        if (typeof extras === "string") {
            setErro(extras)
            return
        }

        setEnviando(true)
        setErro(null)

        try {
            const { criado } = await api<{ criado: Usuario }>("/usuarios", {
                method: "POST",
                body: {
                    nome: dados.get("name"),
                    email: dados.get("email"),
                    senha: dados.get("password"),
                    telefone: dados.get("phone") ?? "",
                    rua: dados.get("street"),
                    numero: dados.get("number"),
                    complemento: dados.get("complement") ?? "",
                    cidade: dados.get("city"),
                    uf: String(dados.get("state") ?? "").toUpperCase(),
                    tipo,
                    aceite_privacidade: dados.get("privacy") === "on",
                    ...extras,
                },
            })

            // a API já inicia a sessão após o cadastro
            definirUsuario(criado)
            router.push(tipo === "doador" ? "/announce" : "/products")
        } catch (e) {
            setErro(mensagemDeErro(e))
            setEnviando(false)
        }
    }

    return { handleSubmit, enviando, erro }
}
