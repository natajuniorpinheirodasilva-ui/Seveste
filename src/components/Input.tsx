import type { InputHTMLAttributes } from "react"

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string
}

export default function Input({ label, id, name, className = "", ...props }: InputProps) {
    const inputId = id ?? name

    return (
        <label htmlFor={inputId} className="flex flex-col gap-2 text-sm font-medium text-seveste-text">
            {label}
            <input
                id={inputId}
                name={name}
                className={`w-full border border-seveste-sage/60 bg-seveste-white px-4 py-3 text-base text-seveste-text outline-none transition placeholder:text-seveste-muted/70 focus:border-seveste-green focus:ring-2 focus:ring-seveste-green/20 ${className}`}
                {...props}
            />
        </label>
    )
}
