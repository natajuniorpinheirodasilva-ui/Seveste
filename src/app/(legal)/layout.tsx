import Navbar from "@/components/Navbar"
import Link from "next/link"
import type { ReactNode } from "react"

const paginas = [
    { href: "/privacy-policy", label: "Política de Privacidade" },
    { href: "/terms-of-use", label: "Termos de Uso" },
    { href: "/cookie-policy", label: "Política de Cookies" },
]

export default function LegalLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50 text-seveste-text">
            <header>
                <Navbar />
            </header>

            <main className="mx-auto max-w-4xl px-6 py-12 md:px-12 lg:py-16">
                <nav className="mb-8 flex flex-wrap gap-2" aria-label="Documentos legais">
                    {paginas.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-seveste-muted transition-all hover:border-seveste-green hover:text-seveste-dark"
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-10 [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-seveste-dark [&_li]:mb-1 [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-seveste-muted [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-seveste-muted">
                    {children}
                </article>

                <p className="mt-8 text-center text-sm text-seveste-muted">
                    <Link href="/" className="font-semibold text-seveste-green hover:text-seveste-dark">Voltar ao início</Link>
                </p>
            </main>
        </div>
    )
}
