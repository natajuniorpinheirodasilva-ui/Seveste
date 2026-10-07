import Navbar from "@/components/Navbar"
import Link from "next/link"
import {
    ArrowRight,
    Heart,
    HandHelping,
    UserPlus,
    Package,
    MapPin,
    Shirt,
    Snowflake,
    Briefcase,
    Baby,
    MessageCircle,
    ShieldCheck
} from "lucide-react"

export default function Home() {
    return (
        <div className="min-h-screen bg-seveste-white text-seveste-text">
            <header>
                <Navbar />
            </header>

            <main>
                <section className="mx-6 mt-8 mb-16 flex min-h-[85dvh] flex-col overflow-hidden rounded-2xl shadow-xl md:mx-16 md:flex-row lg:mx-30">
                    <div className="group relative flex flex-1 flex-col justify-center bg-seveste-white p-8 transition-colors duration-500 hover:bg-slate-50 md:p-10 lg:p-14">
                        <span className="mb-5 flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-[0.28em] text-seveste-green">
                            <Heart className="h-4 w-4 transition-transform duration-300 group-hover:scale-125" />
                            Compartilhe cuidado
                        </span>

                        <h1 className="max-w-xl text-4xl leading-[0.95] md:text-5xl lg:text-6xl">
                            Uma doação faz toda a <span className="font-bold">diferença</span>. <br />
                            Doe <span className="font-bold">agora</span>. Mude <span className="font-bold">vidas</span>.
                        </h1>

                        <p className="mt-6 max-w-md text-base leading-relaxed text-seveste-muted transition-colors duration-300">
                            Uma peça parada no seu armário pode representar acolhimento e dignidade para outra pessoa.
                        </p>

                        <Link
                            href="/join?role=donor"
                            className="group/btn mt-8 flex w-fit items-center gap-2 border border-seveste-dark bg-seveste-dark px-6 py-3 font-sans text-base font-semibold tracking-wide text-seveste-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-seveste-green hover:bg-seveste-green hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seveste-green"
                        >
                            Quero doar
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                        </Link>
                    </div>

                    <div className="group relative flex flex-1 flex-col justify-center bg-seveste-dark p-8 text-seveste-white transition-colors duration-500 hover:bg-zinc-900 md:p-10 lg:p-14">
                        <span className="mb-5 flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-[0.28em] text-seveste-accent">
                            <HandHelping className="h-4 w-4 transition-transform duration-300 group-hover:scale-125" />
                            Encontre acolhimento
                        </span>

                        <h2 className="max-w-xl text-4xl leading-[0.95] md:text-5xl lg:text-6xl">
                            Precisa de uma peça? Podemos te <span className="font-bold">ajudar</span>. <br />
                            Cadastre-se <span className="font-bold">agora</span>. Seja <span className="font-bold">acolhido</span>.
                        </h2>

                        <p className="mt-6 max-w-md text-base leading-relaxed text-seveste-surface transition-colors duration-300">
                            Conte com uma rede feita para aproximar quem deseja ajudar de quem precisa receber.
                        </p>

                        <Link
                            href="/join?role=recipient"
                            className="group/btn mt-8 flex w-fit items-center gap-2 border border-seveste-accent bg-seveste-accent px-6 py-3 font-sans text-base font-semibold tracking-wide text-seveste-dark shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-seveste-white hover:bg-seveste-white hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seveste-white"
                        >
                            Quero receber
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                        </Link>
                    </div>
                </section>

                <section className="mx-6 mb-24 md:mx-16 lg:mx-30">
                    <div className="mb-12 text-center md:text-left">
                        <h3 className="text-3xl font-bold tracking-tight md:text-4xl">Como a rede funciona</h3>
                        <p className="mt-4 text-base text-seveste-muted md:text-lg">
                            Passos simples para conectar quem tem a quem precisa.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
                        <div className="group flex flex-col items-start rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:border-seveste-green hover:shadow-xl">
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-seveste-green/10 text-seveste-green transition-all duration-500 group-hover:scale-110 group-hover:bg-seveste-green group-hover:text-white group-hover:shadow-md">
                                <UserPlus className="h-7 w-7" />
                            </div>
                            <h4 className="mb-3 text-xl font-bold">1. Cadastro rápido</h4>
                            <p className="text-sm leading-relaxed text-seveste-muted">
                                Crie sua conta informando se você deseja doar itens ou se está precisando de doações. O processo leva apenas alguns minutos.
                            </p>
                        </div>

                        <div className="group flex flex-col items-start rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:border-seveste-dark hover:shadow-xl">
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-seveste-dark/10 text-seveste-dark transition-all duration-500 group-hover:scale-110 group-hover:bg-seveste-dark group-hover:text-white group-hover:shadow-md">
                                <Package className="h-7 w-7" />
                            </div>
                            <h4 className="mb-3 text-xl font-bold">2. Anúncio ou busca</h4>
                            <p className="text-sm leading-relaxed text-seveste-muted">
                                Publique as peças que deseja doar com detalhes e fotos, ou busque pelo que você precisa em nossa vitrine solidária.
                            </p>
                        </div>

                        <div className="group flex flex-col items-start rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:border-seveste-accent hover:shadow-xl">
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-seveste-accent/20 text-yellow-600 transition-all duration-500 group-hover:scale-110 group-hover:bg-seveste-accent group-hover:text-seveste-dark group-hover:shadow-md">
                                <MapPin className="h-7 w-7" />
                            </div>
                            <h4 className="mb-3 text-xl font-bold">3. Conexão direta</h4>
                            <p className="text-sm leading-relaxed text-seveste-muted">
                                Utilize a plataforma para combinar a entrega diretamente com a outra pessoa, de forma segura e prática.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="bg-slate-50 py-20">
                    <div className="mx-6 md:mx-16 lg:mx-30">
                        <div className="mb-12 text-center md:text-left">
                            <h3 className="text-3xl font-bold tracking-tight md:text-4xl">O que você pode doar?</h3>
                            <p className="mt-4 text-base text-seveste-muted md:text-lg">
                                Aceitamos diversos tipos de itens em bom estado de conservação.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                { icon: Shirt, title: "Roupas do dia a dia", desc: "Camisetas, calças, bermudas e vestidos limpos e sem rasgos." },
                                { icon: Snowflake, title: "Agasalhos", desc: "Blusas de frio, casacos e jaquetas para aquecer quem precisa." },
                                { icon: Baby, title: "Moda infantil", desc: "Peças para bebês e crianças que perdem roupas rapidamente." },
                                { icon: Briefcase, title: "Acessórios", desc: "Bolsas, mochilas e calçados em condições de uso." }
                            ].map((item, index) => (
                                <div key={index} className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-seveste-dark hover:shadow-lg">
                                    <item.icon className="mb-4 h-8 w-8 text-seveste-dark transition-transform duration-300 group-hover:scale-110 group-hover:text-seveste-green" />
                                    <h4 className="mb-2 font-bold transition-colors duration-300 group-hover:text-seveste-green">{item.title}</h4>
                                    <p className="text-sm text-seveste-muted">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mx-6 my-24 md:mx-16 lg:mx-30">
                    <div className="flex flex-col items-center justify-between gap-10 rounded-3xl bg-seveste-dark p-10 text-seveste-white md:flex-row md:p-16">
                        <div className="max-w-xl text-center md:text-left">
                            <h3 className="mb-4 text-3xl font-bold lg:text-4xl">Dúvidas sobre o processo?</h3>
                            <p className="text-seveste-surface">
                                Nossa plataforma foi desenhada para garantir segurança e transparência. A comunicação é feita internamente e você decide como e onde realizar a entrega.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4 w-full md:w-auto">
                            <div className="group flex items-center gap-4 rounded-lg bg-white/5 p-4 transition-colors duration-300 hover:bg-white/10">
                                <ShieldCheck className="h-6 w-6 text-seveste-accent" />
                                <span className="font-medium">Ambiente verificado</span>
                            </div>
                            <div className="group flex items-center gap-4 rounded-lg bg-white/5 p-4 transition-colors duration-300 hover:bg-white/10">
                                <MessageCircle className="h-6 w-6 text-seveste-accent" />
                                <span className="font-medium">Chat integrado seguro</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-gray-200 bg-white py-12">
                <div className="mx-6 flex flex-col items-center justify-between gap-6 md:mx-16 md:flex-row lg:mx-30">
                    <div className="text-xl font-bold tracking-tighter text-seveste-dark">
                        Seveste.
                    </div>
                    <div className="flex gap-6 text-sm font-medium text-seveste-muted">
                        <Link href="/about" className="transition-colors duration-200 hover:text-seveste-green">Sobre</Link>
                        <Link href="/terms" className="transition-colors duration-200 hover:text-seveste-green">Termos de Uso</Link>
                        <Link href="/privacy" className="transition-colors duration-200 hover:text-seveste-green">Privacidade</Link>
                    </div>
                    <div className="text-sm text-seveste-muted">
                        © {new Date().getFullYear()} Seveste.
                    </div>
                </div>
            </footer>
        </div>
    )
}