import { Star } from "lucide-react"

type StarsProps = {
    nota: number
    className?: string
}

export default function Stars({ nota, className = "h-4 w-4" }: StarsProps) {
    const cheias = Math.round(nota)

    return (
        <span className="flex text-yellow-500" aria-label={`Nota ${nota.toFixed(1)} de 5`}>
            {[1, 2, 3, 4, 5].map((estrela) => (
                <Star
                    key={estrela}
                    className={`${className} ${estrela <= cheias ? "fill-current" : "text-gray-300"}`}
                    aria-hidden="true"
                />
            ))}
        </span>
    )
}
