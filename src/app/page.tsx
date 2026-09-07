import Navbar from "@/components/Navbar"
import Link from "next/link"

export default function Home() {
    return (
        <div>
            <header>
                <Navbar />
            </header>
            <main className="bg-seveste-text">
                <section className="mx-6 mb-12 flex min-h-dvh flex-col overflow-hidden bg-seveste-white shadow-xl md:mx-16 md:mb-20 md:flex-row lg:mx-30">
                    <div className="flex flex-1 flex-col justify-center p-8 md:p-10 lg:p-14">
                        <span className="mb-5 font-sans text-xs font-bold uppercase tracking-[0.28em] text-seveste-green">
                            Compartilhe cuidado
                        </span>

                        <h1 className="max-w-xl text-4xl leading-[0.95] md:text-5xl lg:text-6xl">
                            Uma doação faz toda a <span className="font-bold">diferença</span>. <br />
                            Doe <span className="font-bold">agora</span>. Mude <span className="font-bold">vidas</span>.
                        </h1>

                        <p className="mt-6 max-w-md text-base leading-relaxed text-seveste-muted">
                            Uma peça parada no seu armário pode representar acolhimento e dignidade para outra pessoa.
                        </p>

                        <Link
                            href="/join?role=donor"
                            className="border-seveste-dark bg-seveste-dark text-seveste-white hover:border-seveste-green hover:bg-seveste-green focus-visible:outline-seveste-accent mt-8 w-fit cursor-pointer border px-6 py-3 font-sans text-base font-semibold tracking-wide shadow-sm transition duration-200 hover:-translate-y-px hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                            Quero doar
                        </Link>
                    </div>

                    <div className="flex flex-1 flex-col justify-center bg-seveste-dark p-8 text-seveste-white md:p-10 lg:p-14">
                        <span className="mb-5 font-sans text-xs font-bold uppercase tracking-[0.28em] text-seveste-accent">
                            Encontre acolhimento
                        </span>

                        <h2 className="max-w-xl text-4xl leading-[0.95] md:text-5xl lg:text-6xl">
                            Precisa de uma peça? Podemos te <span className="font-bold">ajudar</span>. <br />
                            Cadastre-se <span className="font-bold">agora</span>. Seja <span className="font-bold">acolhido</span>.
                        </h2>

                        <p className="mt-6 max-w-md text-base leading-relaxed text-seveste-surface">
                            Conte com uma rede feita para aproximar quem deseja ajudar de quem precisa receber.
                        </p>

                        <Link
                            className="border-seveste-accent bg-seveste-accent text-seveste-dark hover:border-seveste-white hover:bg-seveste-white focus-visible:outline-seveste-accent mt-8 w-fit cursor-pointer border px-6 py-3 font-sans text-base font-semibold tracking-wide shadow-sm transition duration-200 hover:-translate-y-px hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2"
                            href="/join?role=recipient"
                        >
                            Quero receber
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    )
}
