import Image from "next/image"
import { Image as ImageIcon } from "lucide-react"
import { urlFoto } from "@/lib/api"

type DonationPhotoProps = {
    foto?: string
    alt: string
    iconClassName?: string
    imageClassName?: string
}

// Mostra a foto da doação ou, se não houver, o ícone de placeholder usado no layout.
// Deve ser colocado dentro de um container com "relative" e tamanho definido.
export default function DonationPhoto({ foto, alt, iconClassName = "h-10 w-10", imageClassName = "" }: DonationPhotoProps) {
    if (!foto) {
        return <ImageIcon className={`text-slate-300 ${iconClassName}`} aria-hidden="true" />
    }

    return (
        <Image
            src={urlFoto(foto)}
            alt={alt}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 33vw"
            className={`object-cover ${imageClassName}`}
        />
    )
}
