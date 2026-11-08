"use client"

import { useState, useEffect, useRef } from "react"
import {
    MessageCircle,
    X,
    ChevronLeft,
    Send,
    User,
    CheckCheck
} from "lucide-react"

// Dados simulados para demonstração
const INITIAL_CHATS = [
    {
        id: 1,
        name: "Maria Silva",
        role: "Doadora",
        avatar: "M",
        unread: 2,
        online: true,
        messages: [
            { id: 1, text: "Olá! Vi que você se interessou pelo casaco de lã.", sender: "them", time: "10:30" },
            { id: 2, text: "Podemos marcar a entrega na estação da linha azul amanhã?", sender: "them", time: "10:31" }
        ]
    },
    {
        id: 2,
        name: "Carlos Souza",
        role: "Recebedor",
        avatar: "C",
        unread: 0,
        online: false,
        messages: [
            { id: 1, text: "Boa tarde! Aquele cobertor ainda está disponível?", sender: "them", time: "Ontem" },
            { id: 2, text: "Sim, Carlos! Está separado para você.", sender: "me", time: "Ontem" },
            { id: 3, text: "Perfeito, muito obrigado! Passo aí na sexta.", sender: "them", time: "Ontem" }
        ]
    },
    {
        id: 3,
        name: "Ana Clara",
        role: "Doadora",
        avatar: "A",
        unread: 0,
        online: true,
        messages: [
            { id: 1, text: "As roupinhas de bebê serviram?", sender: "them", time: "Segunda" },
            { id: 2, text: "Serviram perfeitamente! Gratidão enorme, Ana. Ajudou muito minha sobrinha.", sender: "me", time: "Segunda" }
        ]
    }
]

export default function ChatBubble() {
    const [isOpen, setIsOpen] = useState(false)
    const [activeChatId, setActiveChatId] = useState<number | null>(null)
    const [chats, setChats] = useState(INITIAL_CHATS)
    const [inputText, setInputText] = useState("")

    // Ref para rolar o chat para baixo automaticamente
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    // Rola para baixo sempre que um chat é aberto ou nova mensagem chega
    useEffect(() => {
        if (isOpen && activeChatId) {
            scrollToBottom()
        }
    }, [isOpen, activeChatId, chats])

    const activeChat = chats.find(c => c.id === activeChatId)

    const handleOpenChat = (id: number) => {
        // Zera as mensagens não lidas ao abrir
        setChats(chats.map(chat =>
            chat.id === id ? { ...chat, unread: 0 } : chat
        ))
        setActiveChatId(id)
    }

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputText.trim() || !activeChatId) return

        const newMessage = {
            id: Date.now(),
            text: inputText,
            sender: "me",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }

        setChats(chats.map(chat => {
            if (chat.id === activeChatId) {
                return {
                    ...chat,
                    messages: [...chat.messages, newMessage]
                }
            }
            return chat
        }))

        setInputText("")
    }

    // Calcula total de mensagens não lidas para o badge da bolha
    const totalUnread = chats.reduce((acc, chat) => acc + chat.unread, 0)

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

            {/* Painel do Chat */}
            <div
                className={`mb-4 flex w-[calc(100vw-3rem)] sm:w-96 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] origin-bottom-right ${isOpen ? "h-128 max-h-[75vh] scale-100 opacity-100" : "h-0 scale-50 opacity-0 pointer-events-none"
                    }`}
            >
                {/* Header dinâmico */}
                <div className="flex items-center justify-between bg-seveste-dark p-4 text-white">
                    {activeChatId && activeChat ? (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setActiveChatId(null)}
                                className="rounded-full p-1 transition-colors hover:bg-white/20"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <div className="flex items-center gap-2">
                                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-slate-600 text-sm font-bold">
                                    {activeChat.avatar}
                                    {activeChat.online && (
                                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-seveste-dark bg-green-500"></span>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold leading-tight">{activeChat.name}</span>
                                    <span className="text-[10px] text-slate-300">{activeChat.role}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <h3 className="text-lg font-bold">Mensagens</h3>
                    )}

                    <button
                        onClick={() => setIsOpen(false)}
                        className="rounded-full p-1 transition-colors hover:bg-white/20"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Corpo (Lista de Chats OU Chat Ativo) */}
                <div className="flex flex-1 flex-col overflow-hidden bg-slate-50">

                    {/* Lista de Conversas */}
                    {!activeChatId && (
                        <div className="flex-1 overflow-y-auto">
                            {chats.map((chat) => (
                                <div
                                    key={chat.id}
                                    onClick={() => handleOpenChat(chat.id)}
                                    className="flex cursor-pointer items-center gap-4 border-b border-gray-100 bg-white p-4 transition-colors hover:bg-slate-50"
                                >
                                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-200 text-seveste-dark">
                                        <span className="text-lg font-bold">{chat.avatar}</span>
                                        {chat.online && (
                                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col overflow-hidden">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-seveste-dark">{chat.name}</span>
                                            <span className="text-xs text-slate-400">
                                                {chat.messages[chat.messages.length - 1].time}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2 mt-0.5">
                                            <span className={`truncate text-sm ${chat.unread > 0 ? "font-semibold text-seveste-dark" : "text-seveste-muted"}`}>
                                                {chat.messages[chat.messages.length - 1].sender === "me" ? "Você: " : ""}
                                                {chat.messages[chat.messages.length - 1].text}
                                            </span>
                                            {chat.unread > 0 && (
                                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-seveste-green text-[10px] font-bold text-white">
                                                    {chat.unread}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Chat Ativo (Mensagens) */}
                    {activeChatId && activeChat && (
                        <div className="flex flex-1 flex-col overflow-hidden">

                            {/* Histórico */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {activeChat.messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"}`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${msg.sender === "me"
                                                ? "rounded-br-none bg-seveste-green text-white"
                                                : "rounded-bl-none bg-white text-seveste-dark border border-gray-100"
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                                            {msg.time}
                                            {msg.sender === "me" && <CheckCheck className="h-3 w-3 text-blue-500" />}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Campo de Input */}
                            <form onSubmit={handleSendMessage} className="border-t border-gray-200 bg-white p-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Escreva uma mensagem..."
                                        className="flex-1 rounded-full border border-gray-300 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-seveste-green focus:ring-1 focus:ring-seveste-green"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!inputText.trim()}
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-seveste-dark text-white transition-all hover:bg-seveste-green disabled:opacity-50 disabled:hover:bg-seveste-dark"
                                    >
                                        <Send className="h-4 w-4 ml-0.5" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Botão Flutuante (Bolha) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-seveste-dark text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-seveste-green focus:outline-none focus:ring-4 focus:ring-seveste-green/30"
                aria-label="Abrir mensagens"
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