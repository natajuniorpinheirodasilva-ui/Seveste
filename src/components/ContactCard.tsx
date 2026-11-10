import { Mail, MapPin, Phone, Truck, UserRound } from "lucide-react"
import type { Contato, TipoEntrega } from "@/lib/types"

type ContactCardProps = {
    contato: Contato
    tipoEntrega?: TipoEntrega
    souDoador: boolean
}

// Dados de contato da outra parte de uma doação aceita.
// Só aparecem depois do aceite e somente para as duas pessoas envolvidas (LGPD).
export default function ContactCard({ contato, tipoEntrega, souDoador }: ContactCardProps) {
    const enderecoCompleto = contato.rua
        ? `${contato.rua}, ${contato.numero}${contato.complemento ? ` - ${contato.complemento}` : ""}`
        : null

    const orientacao = souDoador
        ? tipoEntrega === "frete"
            ? "Envie a peça por frete para o endereço abaixo. Combine os detalhes do envio com a pessoa."
            : "Você combinou de levar a peça. Combine dia e horário com a pessoa antes de ir."
        : tipoEntrega === "frete"
            ? "O doador vai enviar a peça por frete para o endereço do seu cadastro."
            : "O doador vai levar a peça até você. Aguarde o contato para combinar dia e horário."

    return (
        <div className="rounded-xl border border-seveste-green/30 bg-seveste-green/5 p-4 text-left text-sm">
            <p className="mb-3 flex items-start gap-2 text-seveste-dark">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-seveste-green" aria-hidden="true" />
                {orientacao}
            </p>
            <ul className="space-y-1.5 text-seveste-muted">
                <li className="flex items-center gap-2">
                    <UserRound className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <strong className="text-seveste-dark">{contato.nome}</strong>
                </li>
                <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="break-all">{contato.email}</span>
                </li>
                {contato.telefone && (
                    <li className="flex items-center gap-2">
                        <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {contato.telefone}
                    </li>
                )}
                <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                        {enderecoCompleto && <>{enderecoCompleto}<br /></>}
                        {contato.cidade} - {contato.uf}
                    </span>
                </li>
            </ul>
            <p className="mt-3 text-xs text-seveste-muted">
                Use esses dados apenas para combinar esta doação.
            </p>
        </div>
    )
}
