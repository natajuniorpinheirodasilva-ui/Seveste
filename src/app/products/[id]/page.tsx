import Navbar from "@/components/Navbar"
import Link from "next/link"
import {
    ChevronRight,
    MapPin,
    MessageCircle,
    User,
    Clock,
    ShieldAlert,
    Heart,
    Tag,
    Share2,
    Image as ImageIcon,
    Eye,
    Users,
    Star,
    AlertTriangle,
    Palette,
    Layers,
    Info
} from "lucide-react"

export default function ProductDetail() {
    return (
        <div className="min-h-screen bg-slate-50 text-seveste-text pb-20">
            <header>
                <Navbar />
            </header>

            <main className="mx-auto max-w-6xl px-6 py-8 md:px-12 lg:py-12">

                {/* Breadcrumbs */}
                <nav className="mb-8 flex flex-wrap items-center text-sm text-seveste-muted">
                    <Link href="/" className="transition-colors hover:text-seveste-green">Início</Link>
                    <ChevronRight className="mx-2 h-4 w-4" />
                    <Link href="/products" className="transition-colors hover:text-seveste-green">Vitrine</Link>
                    <ChevronRight className="mx-2 h-4 w-4" />
                    <Link href="/products?cat=agasalhos" className="transition-colors hover:text-seveste-green">Agasalhos</Link>
                    <ChevronRight className="mx-2 h-4 w-4" />
                    <span className="font-medium text-seveste-dark">Casaco de lã azul marinho</span>
                </nav>

                <div className="flex flex-col gap-10 lg:flex-row lg:items-start">

                    {/* Coluna Esquerda: Galeria e Ações Secundárias */}
                    <div className="flex w-full flex-col gap-4 lg:w-3/5 lg:sticky lg:top-24">
                        {/* Imagem Principal */}
                        <div className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-200 md:aspect-4/3">
                            <ImageIcon className="h-16 w-16 text-slate-400 transition-transform duration-700 group-hover:scale-110" />

                            {/* Badges flutuantes na imagem */}
                            <div className="absolute left-4 top-4 flex flex-col gap-2">
                                <span className="rounded-full bg-seveste-green px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                                    Para Doação
                                </span>
                            </div>

                            {/* Ações na imagem */}
                            <button className="absolute right-4 top-4 rounded-full bg-white/90 p-3 text-seveste-muted shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                                <Heart className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Miniaturas */}
                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((item, index) => (
                                <div
                                    key={index}
                                    className={`group flex aspect-square cursor-pointer items-center justify-center rounded-xl bg-slate-200 transition-all duration-300 hover:opacity-80 ${index === 0 ? 'ring-2 ring-seveste-green ring-offset-2' : ''}`}
                                >
                                    <ImageIcon className="h-6 w-6 text-slate-400 transition-transform duration-300 group-hover:scale-110" />
                                </div>
                            ))}
                        </div>

                        {/* Denunciar anúncio */}
                        <button className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-400 transition-colors hover:text-red-500">
                            <AlertTriangle className="h-4 w-4" />
                            Tem algo de errado com este anúncio? Denuncie.
                        </button>
                    </div>

                    {/* Coluna Direita: Informações e Conversão */}
                    <div className="flex w-full flex-col lg:w-2/5">

                        {/* Cabeçalho do Anúncio */}
                        <div className="mb-6">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-3 text-xs font-medium text-seveste-muted">
                                    <span className="flex items-center gap-1">
                                        <Eye className="h-4 w-4" /> 124 visualizações
                                    </span>
                                    <span className="flex items-center gap-1 text-orange-500">
                                        <Users className="h-4 w-4" /> 3 pessoas interessadas
                                    </span>
                                </div>
                                <button className="flex items-center gap-2 text-sm text-seveste-muted transition-colors hover:text-seveste-dark">
                                    <Share2 className="h-4 w-4" />
                                    Compartilhar
                                </button>
                            </div>

                            <h1 className="mb-4 text-3xl font-bold leading-tight text-seveste-dark md:text-4xl">
                                Casaco de lã azul marinho longo
                            </h1>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-seveste-muted border-b border-gray-200 pb-6">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4 text-seveste-dark" />
                                    Publicado há 2 horas
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4 text-seveste-accent" />
                                    Centro, São Paulo - SP
                                </div>
                            </div>
                        </div>

                        {/* Perfil do Doador (Elevado para dar mais confiança) */}
                        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-seveste-green">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-seveste-dark text-white">
                                        <User className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-seveste-dark text-lg">Maria Silva</h4>
                                        <div className="flex items-center gap-1 text-sm text-yellow-500">
                                            <Star className="h-4 w-4 fill-current" />
                                            <Star className="h-4 w-4 fill-current" />
                                            <Star className="h-4 w-4 fill-current" />
                                            <Star className="h-4 w-4 fill-current" />
                                            <Star className="h-4 w-4 fill-current text-gray-300" />
                                            <span className="text-seveste-muted ml-1">(12 doações)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-sm">
                                <span className="text-seveste-muted">Responde em cerca de <strong className="text-seveste-dark">1 hora</strong></span>
                                <Link href="/perfil/maria" className="font-semibold text-seveste-green transition-colors hover:text-seveste-dark">
                                    Ver perfil completo
                                </Link>
                            </div>
                        </div>

                        {/* Botão de Ação Principal */}
                        <div className="mb-8">
                            <button className="group flex w-full items-center justify-center gap-2 rounded-xl border border-seveste-dark bg-seveste-dark px-6 py-4 font-sans text-lg font-semibold tracking-wide text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-seveste-green hover:bg-seveste-green hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-seveste-green focus:ring-offset-2">
                                <MessageCircle className="h-6 w-6 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12" />
                                Entrar em contato
                            </button>
                            <p className="mt-3 text-center text-xs text-seveste-muted flex items-center justify-center gap-1">
                                <ShieldAlert className="h-3 w-3" /> Transação segura via chat da plataforma
                            </p>
                        </div>

                        {/* Especificações Detalhadas */}
                        <div className="mb-8">
                            <h3 className="mb-4 text-lg font-bold text-seveste-dark">Características da peça</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col justify-center rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                                    <span className="mb-1 flex items-center gap-1.5 text-xs text-seveste-muted">
                                        <Tag className="h-3.5 w-3.5" /> Tamanho
                                    </span>
                                    <span className="font-semibold text-seveste-dark">M (Médio)</span>
                                </div>
                                <div className="flex flex-col justify-center rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                                    <span className="mb-1 flex items-center gap-1.5 text-xs text-seveste-muted">
                                        <Info className="h-3.5 w-3.5" /> Condição
                                    </span>
                                    <span className="font-semibold text-seveste-dark">Usado (excelente)</span>
                                </div>
                                <div className="flex flex-col justify-center rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                                    <span className="mb-1 flex items-center gap-1.5 text-xs text-seveste-muted">
                                        <Palette className="h-3.5 w-3.5" /> Cor
                                    </span>
                                    <span className="font-semibold text-seveste-dark">Azul Marinho</span>
                                </div>
                                <div className="flex flex-col justify-center rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                                    <span className="mb-1 flex items-center gap-1.5 text-xs text-seveste-muted">
                                        <Layers className="h-3.5 w-3.5" /> Material
                                    </span>
                                    <span className="font-semibold text-seveste-dark">Lã / Poliéster</span>
                                </div>
                            </div>
                        </div>

                        {/* Descrição */}
                        <div className="mb-8 rounded-xl bg-slate-100/50 p-5">
                            <h3 className="mb-3 text-lg font-bold text-seveste-dark">Descrição informada</h3>
                            <p className="leading-relaxed text-seveste-muted">
                                Casaco super quente e confortável, ideal para o inverno rigoroso. Estou doando pois perdi peso e ele ficou muito grande em mim. Foi usado poucas vezes e não possui nenhuma mancha ou rasgo. Já está lavado e higienizado, pronto para uso. Preferência para quem puder retirar na estação de metrô mais próxima.
                            </p>
                        </div>

                        {/* Aviso de Segurança */}
                        <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-5 text-orange-800">
                            <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-orange-600" />
                            <div className="flex flex-col">
                                <h4 className="font-bold text-orange-900 mb-1">Dicas de segurança</h4>
                                <ul className="text-sm leading-relaxed space-y-1 list-disc list-inside">
                                    <li>A Seveste nunca cobra taxas pelas doações.</li>
                                    <li>Não passe seus dados bancários ou senhas.</li>
                                    <li>Combine a entrega em locais públicos e movimentados.</li>
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Seção de Peças Similares */}
                <section className="mt-20 border-t border-gray-200 pt-12">
                    <div className="mb-8 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-seveste-dark">Outras peças que você pode gostar</h2>
                        <Link href="/produtos" className="hidden text-sm font-semibold text-seveste-green hover:underline md:block">
                            Ver mais
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((item, index) => (
                            <Link
                                href={`/produto/sim-${index}`}
                                key={index}
                                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-seveste-green hover:shadow-xl"
                            >
                                <div className="relative flex aspect-4/3 w-full items-center justify-center overflow-hidden bg-slate-100">
                                    <ImageIcon className="h-8 w-8 text-slate-300 transition-transform duration-500 group-hover:scale-125" />
                                </div>
                                <div className="p-4">
                                    <h3 className="mb-1 text-base font-bold text-seveste-dark transition-colors duration-300 group-hover:text-seveste-green">
                                        Jaqueta de frio
                                    </h3>
                                    <p className="text-sm text-seveste-muted">Tamanho G • Usado</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    )
}