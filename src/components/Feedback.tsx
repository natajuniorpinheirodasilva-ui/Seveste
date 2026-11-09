import { AlertCircle, Loader2, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

export function Loading({ texto = "Carregando..." }: { texto?: string }) {
    return (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-seveste-muted" role="status">
            <Loader2 className="h-8 w-8 animate-spin text-seveste-green" aria-hidden="true" />
            <span className="text-sm">{texto}</span>
        </div>
    )
}

export function ErrorMessage({ mensagem }: { mensagem: string }) {
    return (
        <p className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {mensagem}
        </p>
    )
}

type EmptyStateProps = {
    icon: LucideIcon
    titulo: string
    descricao?: string
    children?: ReactNode
}

export function EmptyState({ icon: Icon, titulo, descricao, children }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-seveste-muted">
                <Icon className="h-7 w-7" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-seveste-dark">{titulo}</h3>
            {descricao && <p className="mt-1 max-w-sm text-sm text-seveste-muted">{descricao}</p>}
            {children && <div className="mt-6">{children}</div>}
        </div>
    )
}
