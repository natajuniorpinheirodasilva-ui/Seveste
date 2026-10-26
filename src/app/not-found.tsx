import Navbar from "@/components/Navbar"
import Link from "next/link"
import { SearchX, Home, Search } from "lucide-react"

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50 text-seveste-text">
            <header>
                <Navbar />
            </header>

            <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center md:px-12">

                <div className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-slate-200 text-seveste-muted shadow-inner md:h-40 md:w-40">
                    <SearchX className="h-16 w-16 md:h-20 md:w-20" />
                    {/* Elemento decorativo */}
                    <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-seveste-dark text-white shadow-md">
                        <span className="text-xl font-bold">?</span>
                    </div>
                </div>

                <h1 className="mb-2 text-6xl font-bold tracking-tighter text-seveste-dark md:text-8xl lg:text-9xl">
                    404
                </h1>

                <h2 className="mb-4 text-2xl font-bold tracking-tight text-seveste-dark md:text-3xl">
                    Oops! Esta peça perdeu-se no fundo do armário.
                </h2>

                <p className="mb-10 max-w-md text-base leading-relaxed text-seveste-muted md:text-lg">
                    Não conseguimos encontrar a página que procurava. O anúncio pode ter sido removido, a doação já foi concluída, ou o endereço está incorreto.
                </p>

                <div className="flex w-full flex-col justify-center gap-4 sm:w-auto sm:flex-row">
                    <Link
                        href="/"
                        className="group flex items-center justify-center gap-2 rounded-xl bg-seveste-dark px-6 py-4 font-sans text-base font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-seveste-green hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-seveste-green focus:ring-offset-2"
                    >
                        <Home className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                        Voltar ao Início
                    </Link>

                    <Link
                        href="/produtos"
                        className="group flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-4 font-sans text-base font-semibold text-seveste-dark shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-seveste-dark hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-seveste-dark focus:ring-offset-2"
                    >
                        <Search className="h-5 w-5 text-seveste-muted transition-colors duration-300 group-hover:text-seveste-dark" />
                        Ver Vitrine de Doações
                    </Link>
                </div>

            </main>
        </div>
    )
}