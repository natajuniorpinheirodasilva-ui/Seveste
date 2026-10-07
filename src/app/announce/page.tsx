import Navbar from "@/components/Navbar"
import {
    UploadCloud,
    ImagePlus,
    Info,
    MapPin,
    CheckCircle2,
    AlertCircle
} from "lucide-react"

export default function AnnounceDonation() {
    return (
        <div className="min-h-screen bg-slate-50 text-seveste-text">
            <header>
                <Navbar />
            </header>

            <main className="mx-auto max-w-6xl px-6 py-12 md:px-12 lg:py-16">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Anunciar doação</h1>
                    <p className="mt-2 text-seveste-muted">
                        Preencha os detalhes abaixo para que sua peça encontre quem precisa.
                    </p>
                </div>

                <div className="flex flex-col gap-10 lg:flex-row lg:items-start">

                    {/* Formulário Principal */}
                    <form className="flex-1 space-y-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

                        {/* Seção de Fotos */}
                        <section>
                            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                                <ImagePlus className="h-5 w-5 text-seveste-green" />
                                Fotos da peça
                            </h2>
                            <div className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-slate-50 py-12 transition-all duration-300 hover:border-seveste-green hover:bg-seveste-green/5">
                                <div className="mb-4 rounded-full bg-white p-4 shadow-sm transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                                    <UploadCloud className="h-8 w-8 text-seveste-muted group-hover:text-seveste-green" />
                                </div>
                                <p className="font-medium text-seveste-dark">Clique ou arraste as fotos aqui</p>
                                <p className="mt-1 text-sm text-seveste-muted">PNG, JPG de até 5MB. Máximo de 4 fotos.</p>
                                <input type="file" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" multiple accept="image/*" />
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* Seção de Detalhes */}
                        <section>
                            <h2 className="mb-6 text-xl font-semibold">Detalhes do item</h2>

                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-seveste-dark">Título do anúncio</label>
                                    <input
                                        type="text"
                                        id="title"
                                        placeholder="Ex: Casaco de lã azul marinho"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base outline-none transition-colors duration-200 hover:border-seveste-green focus:border-seveste-green focus:ring-1 focus:ring-seveste-green"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-seveste-dark">Categoria</label>
                                        <select
                                            id="category"
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base outline-none transition-colors duration-200 hover:border-seveste-green focus:border-seveste-green focus:ring-1 focus:ring-seveste-green cursor-pointer"
                                        >
                                            <option value="">Selecione...</option>
                                            <option value="roupas">Roupas</option>
                                            <option value="agasalhos">Agasalhos</option>
                                            <option value="calcados">Calçados</option>
                                            <option value="acessorios">Acessórios</option>
                                            <option value="infantil">Infantil</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="size" className="mb-1.5 block text-sm font-medium text-seveste-dark">Tamanho</label>
                                        <select
                                            id="size"
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base outline-none transition-colors duration-200 hover:border-seveste-green focus:border-seveste-green focus:ring-1 focus:ring-seveste-green cursor-pointer"
                                        >
                                            <option value="">Selecione...</option>
                                            <option value="pp">PP</option>
                                            <option value="p">P</option>
                                            <option value="m">M</option>
                                            <option value="g">G</option>
                                            <option value="gg">GG</option>
                                            <option value="unico">Tamanho Único</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="condition" className="mb-1.5 block text-sm font-medium text-seveste-dark">Condição da peça</label>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        {['Novo (com etiqueta)', 'Usado (excelente)', 'Usado (com marcas)'].map((cond) => (
                                            <label key={cond} className="group flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white p-3 text-sm text-seveste-muted transition-all duration-200 hover:border-seveste-green hover:bg-seveste-green/5 hover:text-seveste-dark has-checked:border-seveste-green has-checked:bg-seveste-green/10 has-checked:text-seveste-dark has-checked:font-semibold">
                                                <input type="radio" name="condition" value={cond} className="sr-only" />
                                                {cond}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-seveste-dark">Descrição</label>
                                    <textarea
                                        id="description"
                                        rows={4}
                                        placeholder="Conte um pouco sobre a peça, detalhes de tecido, modelagem ou motivo da doação..."
                                        className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-base outline-none transition-colors duration-200 hover:border-seveste-green focus:border-seveste-green focus:ring-1 focus:ring-seveste-green"
                                    />
                                </div>
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* Seção de Retirada */}
                        <section>
                            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                                <MapPin className="h-5 w-5 text-seveste-accent" />
                                Local de retirada
                            </h2>
                            <div>
                                <label htmlFor="location" className="mb-1.5 block text-sm font-medium text-seveste-dark">Bairro ou região aproximada</label>
                                <input
                                    type="text"
                                    id="location"
                                    placeholder="Ex: Centro, Próximo ao metrô..."
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base outline-none transition-colors duration-200 hover:border-seveste-green focus:border-seveste-green focus:ring-1 focus:ring-seveste-green"
                                />
                                <p className="mt-2 flex items-center gap-1.5 text-xs text-seveste-muted">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    Por segurança, não informe seu endereço completo aqui. Combine no chat.
                                </p>
                            </div>
                        </section>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full rounded-lg border border-seveste-dark bg-seveste-dark px-6 py-4 font-sans text-base font-semibold tracking-wide text-seveste-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-seveste-green hover:bg-seveste-green hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seveste-green"
                            >
                                Publicar doação
                            </button>
                        </div>
                    </form>

                    {/* Sidebar de Dicas (Desktop) */}
                    <aside className="hidden w-80 shrink-0 flex-col gap-6 lg:flex sticky top-24">
                        <div className="rounded-2xl bg-seveste-dark p-6 text-seveste-white">
                            <div className="mb-4 flex items-center gap-2">
                                <Info className="h-5 w-5 text-seveste-accent" />
                                <h3 className="font-bold">Dicas para um bom anúncio</h3>
                            </div>
                            <ul className="space-y-4 text-sm text-seveste-surface">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-seveste-green" />
                                    <span>Tire fotos em locais iluminados, de preferência com luz natural.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-seveste-green" />
                                    <span>Se houver algum defeito (furo, mancha), mostre na foto e descreva no texto.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-seveste-green" />
                                    <span>Lave a peça antes de entregar. Empatia faz parte da doação.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-6">
                            <h3 className="font-bold text-seveste-dark mb-2">O que acontece agora?</h3>
                            <p className="text-sm text-seveste-muted leading-relaxed">
                                Seu anúncio ficará visível na vitrine. Pessoas interessadas poderão enviar uma mensagem pelo nosso chat seguro para combinar a retirada com você.
                            </p>
                        </div>
                    </aside>

                </div>
            </main>
        </div>
    )
}