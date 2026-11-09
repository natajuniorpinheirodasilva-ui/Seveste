// Permite que qualquer página abra uma conversa no ChatBubble (que fica no layout)

export const EVENTO_ABRIR_CHAT = "seveste:abrir-chat"

export type DetalheAbrirChat = { solicitacaoId: number }

export function abrirChat(solicitacaoId: number) {
    window.dispatchEvent(new CustomEvent<DetalheAbrirChat>(EVENTO_ABRIR_CHAT, { detail: { solicitacaoId } }))
}
