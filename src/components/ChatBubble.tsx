"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import {
    MessageCircle,
    X,
    ChevronLeft,
    Send,
    CheckCheck
} from "lucide-react"
import { useAuth } from "./AuthProvider"
import { api, mensagemDeErro } from "@/lib/api"
import { EVENTO_ABRIR_CHAT, type DetalheAbrirChat } from "@/lib/chat"
import { horaCurta, inicial } from "@/lib/format"
import { rotuloTipo } from "@/lib/constants"
import type { Mensagem, Solicitacao } from "@/lib/types"

const INTERVALO_CONVERSAS = 15000
const INTERVALO_MENSAGENS = 4000

// guarda localmente (só neste navegador) até qual mensagem cada conversa já foi lida
function chaveLidas(usuarioId: number) {
    return `seveste_chat_lidas_${usuarioId}`
}

function lerLidas(usuarioId: number): Record<string, string> {
    try {
        return JSON.parse(localStorage.getItem(chaveLidas(usuarioId)) ?? "{}")
    } catch {
        return {}
    }
}

function salvarLidas(usuarioId: number, lidas: Record<string, string>) {
    try {
        localStorage.setItem(chaveLidas(usuarioId), JSON.stringify(lidas))
    } catch {
        // armazenamento indisponível: o contador de não lidas apenas não persiste
    }
}

function momento(conversa: Solicitacao) {
    return new Date(conversa.ultima_mensagem?.enviada_em ?? conversa.criado_em).getTime()
}

export default function ChatBubble() {
    const { usuario } = useAuth()
    const usuarioId = usuario?.id_usuario
    const ehDoador = usuario?.tipo === "doador"

    const [isOpen, setIsOpen] = useState(false)
    const [activeChatId, setActiveChatId] = useState<number | null>(null)
    const [chats, setChats] = useState<Solicitacao[]>([])
    const [mensagens, setMensagens] = useState<Mensagem[]>([])
    const [lidas, setLidas] = useState<Record<string, string>>({})
    const [inputText, setInputText] = useState("")
    const [erro, setErro] = useState<string | null>(null)
    const [enviando, setEnviando] = useState(false)

    // Ref para rolar o chat para baixo automaticamente
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const carregarConversas = useCallback(async () => {
        if (!usuarioId) return
        try {
            const { solicitacoes } = await api<{ solicitacoes: Solicitacao[] }>(ehDoador ? "/solicitacoes/recebidas" : "/solicitacoes/minhas")
            setChats([...solicitacoes].sort((a, b) => momento(b) - momento(a)))
        } catch {
            // falhas pontuais de rede são ignoradas; a próxima atualização tenta de novo
        }
    }, [usuarioId, ehDoador])

    const carregarMensagens = useCallback(async (id: number) => {
        try {
            const { mensagens } = await api<{ mensagens: Mensagem[] }>(`/solicitacoes/${id}/mensagens`)
            setMensagens(mensagens)
        } catch (e) {
            setErro(mensagemDeErro(e))
        }
    }, [])

    // carrega as conversas ao logar e atualiza periodicamente
    useEffect(() => {
        if (!usuarioId) return

        const inicial = setTimeout(() => {
            setLidas(lerLidas(usuarioId))
            carregarConversas()
        }, 0)
        const intervalo = setInterval(carregarConversas, INTERVALO_CONVERSAS)

        return () => {
            clearTimeout(inicial)
            clearInterval(intervalo)
        }
    }, [usuarioId, carregarConversas])

    // atualiza as mensagens da conversa aberta
    useEffect(() => {
        if (!isOpen || !activeChatId) return

        const inicial = setTimeout(() => carregarMensagens(activeChatId), 0)
        const intervalo = setInterval(() => carregarMensagens(activeChatId), INTERVALO_MENSAGENS)

        return () => {
            clearTimeout(inicial)
            clearInterval(intervalo)
        }
    }, [isOpen, activeChatId, carregarMensagens])

    // outras páginas podem pedir para abrir uma conversa (ex.: "Entrar em contato")
    useEffect(() => {
        const handleAbrir = (event: Event) => {
            const { solicitacaoId } = (event as CustomEvent<DetalheAbrirChat>).detail
            setMensagens([])
            setErro(null)
            setActiveChatId(solicitacaoId)
            setIsOpen(true)
            carregarConversas()
        }

        window.addEventListener(EVENTO_ABRIR_CHAT, handleAbrir)
        return () => window.removeEventListener(EVENTO_ABRIR_CHAT, handleAbrir)
    }, [carregarConversas])

    // Rola para baixo sempre que um chat é aberto ou nova mensagem chega
    useEffect(() => {
        if (isOpen && activeChatId) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }
    }, [isOpen, activeChatId, mensagens.length])

    // marca como lida a última mensagem da conversa aberta
    const ultimaVista = mensagens.at(-1)?.enviada_em
    useEffect(() => {
        if (!usuarioId || !activeChatId || !isOpen || !ultimaVista) return
        const chave = String(activeChatId)
        const timer = setTimeout(() => {
            setLidas((atual) => {
                if (atual[chave] === ultimaVista) return atual
                const novas = { ...atual, [chave]: ultimaVista }
                salvarLidas(usuarioId, novas)
                return novas
            })
        }, 0)
        return () => clearTimeout(timer)
    }, [usuarioId, activeChatId, isOpen, ultimaVista])

    if (!usuario) return null

    const naoLida = (chat: Solicitacao) => {
        const ultima = chat.ultima_mensagem
        if (!ultima || ultima.id_usuario === usuario.id_usuario) return false
        const lida = lidas[String(chat.id_solicitacao)]
        return !lida || new Date(ultima.enviada_em) > new Date(lida)
    }

    const outraParte = (chat: Solicitacao) => (ehDoador ? chat.solicitante : chat.doador)

    const activeChat = chats.find(c => c.id_solicitacao === activeChatId)
    const contato = activeChat ? outraParte(activeChat) : null
    const conversaEncerrada = activeChat?.status === "RECUSADA"

    const handleOpenChat = (id: number) => {
        setMensagens([])
        setErro(null)
        setActiveChatId(id)
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        const texto = inputText.trim()
        if (!texto || !activeChatId || enviando) return

        setEnviando(true)
        setErro(null)
        try {
            const nova = await api<Mensagem>(`/solicitacoes/${activeChatId}/mensagens`, { method: "POST", body: { texto } })
            setMensagens((atuais) => [...atuais, nova])
            setInputText("")
            setChats((atuais) => atuais
                .map((chat) => chat.id_solicitacao === activeChatId ? { ...chat, ultima_mensagem: nova } : chat)
                .sort((a, b) => momento(b) - momento(a)))
        } catch (e) {
            setErro(mensagemDeErro(e))
        } finally {
            setEnviando(false)
        }
    }

    // Calcula total de conversas com mensagens não lidas para o badge da bolha
    const totalUnread = chats.filter(naoLida).length

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

            {/* Painel do Chat */}
            <div
                className={`mb-4 flex w-[calc(100vw-3rem)] sm:w-96 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] origin-bottom-right ${isOpen ? "h-128 max-h-[75vh] scale-100 opacity-100" : "h-0 scale-50 opacity-0 pointer-events-none"
                    }`}
            >
                {/* Header dinâmico */}
                <div className="flex items-center justify-between bg-seveste-dark p-4 text-white">
                    {activeChatId ? (
                        <div className="flex min-w-0 items-center gap-3">
                            <button
                                onClick={() => setActiveChatId(null)}
                                className="rounded-full p-1 transition-colors hover:bg-white/20"
                                aria-label="Voltar para conversas"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <div className="flex min-w-0 items-center gap-2">
                                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-600 text-sm font-bold">
                                    {inicial(contato?.nome)}
                                </div>
                                <div className="flex min-w-0 flex-col">
                                    <span className="truncate text-sm font-bold leading-tight">{contato?.nome ?? "Conversa"}</span>
                                    <span className="truncate text-[10px] text-slate-300">
                                        {contato ? rotuloTipo(contato.tipo) : ""}
                                        {activeChat?.doacao && <> • {activeChat.doacao.titulo}</>}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <h3 className="text-lg font-bold">Mensagens</h3>
                    )}

                    <button
                        onClick={() => setIsOpen(false)}
                        className="rounded-full p-1 transition-colors hover:bg-white/20"
                        aria-label="Fechar mensagens"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Corpo (Lista de Chats OU Chat Ativo) */}
                <div className="flex flex-1 flex-col overflow-hidden bg-slate-50">

                    {/* Lista de Conversas */}
                    {!activeChatId && (
                        <div className="flex-1 overflow-y-auto">
                            {chats.length === 0 && (
                                <div className="flex h-full flex-col items-center justify-center p-8 text-center text-sm text-seveste-muted">
                                    <MessageCircle className="mb-3 h-10 w-10 text-slate-300" />
                                    {ehDoador
                                        ? "Quando alguém se interessar pelas suas doações, a conversa aparecerá aqui."
                                        : <>Encontre uma peça na <Link href="/products" className="font-semibold text-seveste-green underline">vitrine</Link> e clique em &ldquo;Entrar em contato&rdquo;.</>}
                                </div>
                            )}
                            {chats.map((chat) => {
                                const pessoa = outraParte(chat)
                                const ultima = chat.ultima_mensagem
                                const unread = naoLida(chat)
                                return (
                                    <button
                                        key={chat.id_solicitacao}
                                        onClick={() => handleOpenChat(chat.id_solicitacao)}
                                        className="flex w-full cursor-pointer items-center gap-4 border-b border-gray-100 bg-white p-4 text-left transition-colors hover:bg-slate-50"
                                    >
                                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-200 text-seveste-dark">
                                            <span className="text-lg font-bold">{inicial(pessoa?.nome)}</span>
                                        </div>
                                        <div className="flex flex-1 flex-col overflow-hidden">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="truncate font-bold text-seveste-dark">{pessoa?.nome ?? "Usuário removido"}</span>
                                                <span className="shrink-0 text-xs text-slate-400">
                                                    {horaCurta(ultima?.enviada_em ?? chat.criado_em)}
                                                </span>
                                            </div>
                                            <span className="truncate text-xs text-seveste-green">{chat.doacao?.titulo}</span>
                                            <div className="flex items-center justify-between gap-2 mt-0.5">
                                                <span className={`truncate text-sm ${unread ? "font-semibold text-seveste-dark" : "text-seveste-muted"}`}>
                                                    {ultima
                                                        ? <>{ultima.id_usuario === usuario.id_usuario ? "Você: " : ""}{ultima.texto}</>
                                                        : "Nenhuma mensagem ainda"}
                                                </span>
                                                {unread && (
                                                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-seveste-green" aria-label="Não lida" />
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {/* Chat Ativo (Mensagens) */}
                    {activeChatId && (
                        <div className="flex flex-1 flex-col overflow-hidden">

                            {activeChat?.doacao && (
                                <Link
                                    href={`/products/${activeChat.doacao.id_doacao}`}
                                    className="border-b border-gray-200 bg-white px-4 py-2 text-xs text-seveste-muted hover:text-seveste-green"
                                >
                                    Sobre: <strong className="text-seveste-dark">{activeChat.doacao.titulo}</strong>
                                    {activeChat.status === "ACEITA" && " • Doação concluída"}
                                </Link>
                            )}

                            {/* Histórico */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {mensagens.length === 0 && (
                                    <p className="pt-8 text-center text-sm text-seveste-muted">
                                        Diga olá e combine a entrega em um local público.
                                    </p>
                                )}
                                {mensagens.map((msg) => {
                                    const minha = msg.id_usuario === usuario.id_usuario
                                    return (
                                        <div
                                            key={msg.id_mensagem}
                                            className={`flex flex-col ${minha ? "items-end" : "items-start"}`}
                                        >
                                            <div
                                                className={`max-w-[85%] whitespace-pre-wrap wrap-break-word rounded-2xl px-4 py-2.5 text-sm shadow-sm ${minha
                                                    ? "rounded-br-none bg-seveste-green text-white"
                                                    : "rounded-bl-none bg-white text-seveste-dark border border-gray-100"
                                                    }`}
                                            >
                                                {msg.texto}
                                            </div>
                                            <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                                                {horaCurta(msg.enviada_em)}
                                                {minha && <CheckCheck className="h-3 w-3 text-blue-500" />}
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {erro && <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700" role="alert">{erro}</p>}

                            {/* Campo de Input */}
                            {conversaEncerrada ? (
                                <p className="border-t border-gray-200 bg-white p-4 text-center text-xs text-seveste-muted">
                                    Esta solicitação não foi aceita e a conversa foi encerrada.
                                </p>
                            ) : (
                                <form onSubmit={handleSendMessage} className="border-t border-gray-200 bg-white p-3">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            placeholder="Escreva uma mensagem..."
                                            maxLength={1000}
                                            aria-label="Mensagem"
                                            className="flex-1 rounded-full border border-gray-300 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-seveste-green focus:ring-1 focus:ring-seveste-green"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!inputText.trim() || enviando}
                                            aria-label="Enviar mensagem"
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-seveste-dark text-white transition-all hover:bg-seveste-green disabled:opacity-50 disabled:hover:bg-seveste-dark"
                                        >
                                            <Send className="h-4 w-4 ml-0.5" />
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Botão Flutuante (Bolha) */}
            <button
                onClick={() => {
                    if (!isOpen) carregarConversas()
                    setIsOpen(!isOpen)
                }}
                className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-seveste-dark text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-seveste-green focus:outline-none focus:ring-4 focus:ring-seveste-green/30"
                aria-label={isOpen ? "Fechar mensagens" : "Abrir mensagens"}
            >
                {isOpen ? (
                    <X className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" />
                ) : (
                    <>
                        <MessageCircle className="h-6 w-6 transition-transform duration-300 group-hover:-translate-y-0.5" />
                        {totalUnread > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-red-500 text-xs font-bold text-white shadow-sm animate-bounce">
                                {totalUnread}
                            </span>
                        )}
                    </>
                )}
            </button>
        </div>
    )
}
