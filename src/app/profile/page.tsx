import Navbar from "@/components/Navbar"
import Link from "next/link"
import {
    MapPin,
    MessageCircle,
    User,
    Clock,
    ShieldCheck,
    Star,
    Award,
    Package,
    ThumbsUp,
    Image as ImageIcon,
    CheckCircle2,
    Calendar
} from "lucide-react"

export default function UserProfile() {
    return (
        <div className="min-h-screen bg-slate-50 text-seveste-text pb-24">
            <header>
                <Navbar />
            </header>

            <main className="mx-auto max-w-6xl px-6 pt-6 md:px-12 md:pt-10 lg:pt-12">

                {/* Header do Perfil (Capa e Info Principal) */}
                <section className="mb-10 overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-200">
                    {/* Capa */}
                    <div className="h-32 w-full bg-linear-to-r from-seveste-dark to-slate-700 md:h-48 relative">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                    </div>

                    {/* Informações do Usuário */}
                    <div className="relative px-6 pb-8 md:px-10">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between">

                            {/* Avatar e Nome */}
                            <div className="flex flex-col md:flex-row md:items-end gap-5 -mt-12 md:-mt-16 relative z-10">
                                <div className="flex h-24 w-24 md:h-32 md:w-32 items-center justify-center rounded-full border-4 border-white bg-slate-200 text-seveste-muted shadow-md overflow-hidden">
                                    <User className="h-12 w-12 md:h-16 md:w-16" />
                                </div>
                                <div className="mb-2">
                                    <h1 className="flex items-center gap-2 text-3xl font-bold text-seveste-dark md:text-4xl bg-seveste-white/80 rounded">
                                        Maria Silva
                                        <ShieldCheck className="h-6 w-6 text-seveste-green" />
                                    </h1>
                                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-seveste-muted">
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4" /> São Paulo, SP
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4" /> Membro desde 2023
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Ações */}
                            <div className="mt-6 flex gap-3 md:mt-0 md:mb-2">
                                <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-seveste-dark px-6 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-seveste-green hover:shadow-md md:flex-none">
                                    <MessageCircle className="h-5 w-5" />
                                    Enviar Mensagem
                                </button>
                            </div>
                        </div>

                        {/* Bio e Estatísticas */}
                        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                                <h3 className="mb-3 text-lg font-bold text-seveste-dark">Sobre</h3>
                                <p className="leading-relaxed text-seveste-muted">
                                    Acredito que roupas ganham mais vida quando compartilhadas. Gosto de doar peças em ótimo estado que já não uso mais. Sempre lavo e higienizo tudo antes de entregar. Preferência para entregas em estações da linha azul do metrô.
                                </p>

                                <div className="mt-6 flex flex-wrap gap-3">
                                    <div className="flex items-center gap-2 rounded-lg border border-seveste-green/20 bg-seveste-green/5 px-3 py-1.5 text-sm font-medium text-seveste-green">
                                        <Award className="h-4 w-4" /> Doador Frequente
                                    </div>
                                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-seveste-muted">
                                        <CheckCircle2 className="h-4 w-4" /> Identidade Verificada
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col justify-center rounded-2xl bg-slate-50 p-6 border border-gray-100">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <span className="block text-3xl font-bold text-seveste-dark">48</span>
                                        <span className="text-xs font-medium uppercase tracking-wider text-seveste-muted">Doações</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-3xl font-bold text-seveste-dark">4.9</span>
                                        <div className="mt-1 flex justify-center text-yellow-500">
                                            <Star className="h-3 w-3 fill-current" />
                                            <Star className="h-3 w-3 fill-current" />
                                            <Star className="h-3 w-3 fill-current" />
                                            <Star className="h-3 w-3 fill-current" />
                                            <Star className="h-3 w-3 fill-current" />
                                        </div>
                                    </div>
                                    <div className="col-span-2 mt-2 flex items-center justify-center gap-2 border-t border-gray-200 pt-4 text-sm text-seveste-muted">
                                        <Clock className="h-4 w-4" /> Responde em ~1 hora
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex flex-col gap-10 lg:flex-row lg:items-start">

                    {/* Coluna Principal: Anúncios */}
                    <div className="flex-1 w-full">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-2xl font-bold text-seveste-dark">
                                <Package className="h-6 w-6 text-seveste-green" />
                                Doações ativas (4)
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3, 4].map((item, index) => (
                                <Link
                                    className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-seveste-green hover:shadow-xl"
                                    href={`/product/${index}`}
                                    key={index}
                                >
                                    <div className="relative flex aspect-4/3 w-full items-center justify-center overflow-hidden bg-slate-100">
                                        <ImageIcon className="h-10 w-10 text-slate-300 transition-transform duration-500 group-hover:scale-125" />
                                        <div className="absolute left-3 top-3 rounded-full bg-seveste-green px-3 py-1 text-xs font-bold text-white shadow-sm">
                                            Disponível
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="mb-1 text-lg font-bold text-seveste-dark transition-colors duration-300 group-hover:text-seveste-green truncate">
                                            {index % 2 === 0 ? "Casaco de Lã Azul" : "Calça Jeans Tamanho 40"}
                                        </h3>
                                        <p className="mb-4 text-sm text-seveste-muted">Tamanho M • Excelente estado</p>
                                        <div className="font-medium text-seveste-dark transition-colors duration-300 group-hover:text-seveste-green text-sm">
                                            Ver detalhes &rarr;
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                    </div>

                    {/* Coluna Lateral: Avaliações */}
                    <aside className="w-full lg:w-80 shrink-0">
                        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-seveste-dark">
                            <ThumbsUp className="h-5 w-5 text-seveste-accent" />
                            Avaliações
                        </h2>

                        <div className="flex flex-col gap-4">
                            {[
                                { name: "João Pedro", date: "Há 1 semana", text: "As roupas estavam super cheirosas e muito bem cuidadas. A Maria foi super atenciosa no chat." },
                                { name: "Ana Clara", date: "Há 1 mês", text: "Pontual na entrega e as peças eram exatamente como nas fotos. Muito obrigada!" },
                                { name: "Carlos M.", date: "Há 2 meses", text: "Excelente doadora. Me ajudou muito com os agasalhos para minha família." }
                            ].map((review, i) => (
                                <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-seveste-green hover:shadow-md">
                                    <div className="mb-3 flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-seveste-dark font-bold text-sm">
                                                {review.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-seveste-dark">{review.name}</h4>
                                                <div className="flex text-yellow-500">
                                                    <Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm leading-relaxed text-seveste-muted">
                                        "{review.text}"
                                    </p>
                                    <span className="mt-3 block text-xs text-slate-400">{review.date}</span>
                                </div>
                            ))}
                        </div>

                        <button className="mt-6 w-full rounded-xl border border-gray-300 bg-white py-3 text-sm font-semibold text-seveste-dark transition-all hover:bg-slate-50 hover:text-seveste-green">
                            Ver todas as avaliações
                        </button>
                    </aside>

                </div>
            </main>
        </div>
    )
}