"use client"

import { use, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react"
import Navbar from "@/components/Navbar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRequireAuth } from "@/components/AuthProvider"
import DonationPhoto from "@/components/DonationPhoto"
import { ErrorMessage, Loading } from "@/components/Feedback"
import { api, mensagemDeErro } from "@/lib/api"
import { comprimirImagem } from "@/lib/imagem"
import {
    CATEGORIAS,
    CONDICOES,
    MAXIMO_FOTOS,
    TAMANHOS_LETRA,
    TAMANHOS_NUMERICOS,
    TAMANHO_MAXIMO_FOTO,
    TIPOS_ENTREGA,
} from "@/lib/constants"
import type { Doacao } from "@/lib/types"
import {
    UploadCloud,
    ImagePlus,
    Info,
    MapPin,
    CheckCircle2,
    AlertCircle,
    Truck,
    X
} from "lucide-react"

type Campos = {
    titulo: string
    categoria: string
    tamanho: string
    condicao: string
    tipo_de_entrega: string
    descricao: string
    cor: string
    material: string
    local: string
}

const CAMPOS_VAZIOS: Campos = { titulo: "", categoria: "", tamanho: "", condicao: "", tipo_de_entrega: "", descricao: "", cor: "", material: "", local: "" }

type FotoNova = { arquivo: File; preview: string }

const inputClass = "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base outline-none transition-colors duration-200 hover:border-seveste-green focus:border-seveste-green focus:ring-1 focus:ring-seveste-green"
const labelClass = "mb-1.5 block text-sm font-medium text-seveste-dark"

export default function AnnounceDonation({
    searchParams,
}: {
    searchParams: Promise<{ editar?: string | string[] }>
}) {
    const { editar } = use(searchParams)
    const idEdicao = typeof editar === "string" && /^\d+$/.test(editar) ? editar : null

    const { usuario, carregando } = useRequireAuth("doador")
    const router = useRouter()

    const [campos, setCampos] = useState<Campos>(CAMPOS_VAZIOS)
    const [fotosExistentes, setFotosExistentes] = useState<string[]>([])
    const [fotosRemovidas, setFotosRemovidas] = useState<string[]>([])
    const [fotosNovas, setFotosNovas] = useState<FotoNova[]>([])
    const [carregandoDoacao, setCarregandoDoacao] = useState(!!idEdicao)
    const [enviando, setEnviando] = useState(false)
    const [preparandoFotos, setPreparandoFotos] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    // no modo de edição, carrega os dados atuais do anúncio
    useEffect(() => {
        if (!idEdicao || !usuario) return

        api<{ doacao: Doacao }>(`/doacoes/${idEdicao}`)
            .then(({ doacao }) => {
                if (doacao.usuario_id !== usuario.id_usuario) {
                    router.replace("/dashboard")
                    return
                }
                setCampos({
                    titulo: doacao.titulo,
                    categoria: doacao.categoria,
                    tamanho: doacao.tamanho,
                    condicao: doacao.condicao,
                    tipo_de_entrega: doacao.tipo_de_entrega,
                    descricao: doacao.descricao,
                    cor: doacao.cor,
                    material: doacao.material,
                    local: doacao.local,
                })
                setFotosExistentes(doacao.fotos)
            })
            .catch((e) => setErro(mensagemDeErro(e)))
            .finally(() => setCarregandoDoacao(false))
    }, [idEdicao, usuario, router])

    // libera as URLs temporárias das pré-visualizações ao sair da página
    const previews = useRef<string[]>([])
    useEffect(() => {
        const urls = previews.current
        return () => urls.forEach((url) => URL.revokeObjectURL(url))
    }, [])

    const atualizar = (campo: keyof Campos) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setCampos({ ...campos, [campo]: event.target.value })
    }

    const fotosVisiveis = fotosExistentes.filter((foto) => !fotosRemovidas.includes(foto))
    const vagas = MAXIMO_FOTOS - fotosVisiveis.length - fotosNovas.length

    // as fotos são reduzidas no navegador (máx. 1280px, até 1MB) antes de entrar na lista de envio
    const handleSelecionarFotos = async (event: ChangeEvent<HTMLInputElement>) => {
        const arquivos = Array.from(event.target.files ?? [])
        event.target.value = ""
        setErro(null)

        const validos = arquivos.filter((arquivo) => {
            if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type)) {
                setErro(`"${arquivo.name}" não é uma imagem JPG, PNG ou WEBP.`)
                return false
            }
            if (arquivo.size > TAMANHO_MAXIMO_FOTO) {
                setErro(`"${arquivo.name}" é maior que 20MB.`)
                return false
            }
            return true
        })

        if (validos.length > vagas) {
            setErro(`Você pode adicionar no máximo ${MAXIMO_FOTOS} fotos por anúncio.`)
        }

        setPreparandoFotos(true)
        const adicionadas: FotoNova[] = []
        for (const arquivo of validos.slice(0, Math.max(vagas, 0))) {
            try {
                const reduzida = await comprimirImagem(arquivo)
                adicionadas.push({ arquivo: reduzida, preview: URL.createObjectURL(reduzida) })
            } catch (e) {
                setErro(mensagemDeErro(e))
            }
        }
        setPreparandoFotos(false)

        previews.current.push(...adicionadas.map(({ preview }) => preview))
        setFotosNovas((atuais) => [...atuais, ...adicionadas])
    }

    const removerFotoNova = (index: number) => {
        URL.revokeObjectURL(fotosNovas[index].preview)
        setFotosNovas(fotosNovas.filter((_, i) => i !== index))
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!campos.condicao) {
            setErro("Selecione a condição da peça.")
            return
        }

        if (!campos.tipo_de_entrega) {
            setErro("Selecione como a peça será entregue.")
            return
        }

        setEnviando(true)
        setErro(null)

        try {
            let id = idEdicao
            if (id) {
                await api(`/doacoes/${id}`, { method: "PATCH", body: campos })
                for (const foto of fotosRemovidas) {
                    await api(`/doacoes/${id}/fotos/${encodeURIComponent(foto)}`, { method: "DELETE" })
                }
            } else {
                const { criado } = await api<{ criado: Doacao }>("/doacoes", { method: "POST", body: campos })
                id = String(criado.id_doacao)
            }

            // uma foto por requisição: a Vercel aceita no máximo 4,5 MB por requisição
            for (const { arquivo } of fotosNovas) {
                const formulario = new FormData()
                formulario.append("fotos", arquivo)
                await api(`/doacoes/${id}/fotos`, { method: "POST", body: formulario })
            }

            router.push(`/products/${id}`)
        } catch (e) {
            setErro(mensagemDeErro(e))
            setEnviando(false)
        }
    }

    if (carregando || carregandoDoacao) {
        return (
            <div className="min-h-screen bg-slate-50 text-seveste-text">
                <header>
                    <Navbar />
                </header>
                <main className="mx-auto max-w-6xl px-6 py-12 md:px-12">
                    <Loading />
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 text-seveste-text">
            <header>
                <Navbar />
            </header>

            <main className="mx-auto max-w-6xl px-6 py-12 md:px-12 lg:py-16">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{idEdicao ? "Editar doação" : "Anunciar doação"}</h1>
                    <p className="mt-2 text-seveste-muted">
                        Preencha os detalhes abaixo para que sua peça encontre quem precisa.
                    </p>
                </div>

                <div className="flex flex-col gap-10 lg:flex-row lg:items-start">

                    {/* Formulário Principal */}
                    <form onSubmit={handleSubmit} className="flex-1 space-y-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

                        {/* Seção de Fotos */}
                        <section>
                            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                                <ImagePlus className="h-5 w-5 text-seveste-green" />
                                Fotos da peça
                            </h2>

                            {(fotosVisiveis.length > 0 || fotosNovas.length > 0) && (
                                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {fotosVisiveis.map((foto) => (
                                        <div key={foto} className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                                            <DonationPhoto foto={foto} alt="Foto do anúncio" />
                                            <button
                                                type="button"
                                                onClick={() => setFotosRemovidas([...fotosRemovidas, foto])}
                                                className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-red-600 shadow-sm hover:bg-white"
                                                aria-label="Remover foto"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {fotosNovas.map(({ preview }, index) => (
                                        <div key={preview} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                                            {/* eslint-disable-next-line @next/next/no-img-element -- pré-visualização local (blob:) */}
                                            <img src={preview} alt="Nova foto" className="h-full w-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removerFotoNova(index)}
                                                className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-red-600 shadow-sm hover:bg-white"
                                                aria-label="Remover foto"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {vagas > 0 && (
                                <div className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-slate-50 py-12 transition-all duration-300 hover:border-seveste-green hover:bg-seveste-green/5">
                                    <div className="mb-4 rounded-full bg-white p-4 shadow-sm transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                                        <UploadCloud className="h-8 w-8 text-seveste-muted group-hover:text-seveste-green" />
                                    </div>
                                    <p className="font-medium text-seveste-dark">Clique ou arraste as fotos aqui</p>
                                    <p className="mt-1 text-sm text-seveste-muted">{preparandoFotos ? "Preparando fotos..." : "PNG, JPG ou WEBP. Máximo de 4 fotos (elas são reduzidas antes do envio)."}</p>
                                    <input
                                        type="file"
                                        onChange={handleSelecionarFotos}
                                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                        multiple
                                        accept="image/jpeg,image/png,image/webp"
                                        aria-label="Selecionar fotos"
                                    />
                                </div>
                            )}
                        </section>

                        <hr className="border-gray-100" />

                        {/* Seção de Detalhes */}
                        <section>
                            <h2 className="mb-6 text-xl font-semibold">Detalhes do item</h2>

                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="title" className={labelClass}>Título do anúncio *</label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={campos.titulo}
                                        onChange={atualizar("titulo")}
                                        placeholder="Ex: Casaco de lã azul marinho"
                                        maxLength={80}
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="category" className={labelClass}>Categoria *</label>
                                        <select id="category" value={campos.categoria} onChange={atualizar("categoria")} required className={`${inputClass} cursor-pointer`}>
                                            <option value="">Selecione...</option>
                                            {CATEGORIAS.map(({ valor, rotulo }) => <option key={valor} value={valor}>{rotulo}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="size" className={labelClass}>Tamanho *</label>
                                        <select id="size" value={campos.tamanho} onChange={atualizar("tamanho")} required className={`${inputClass} cursor-pointer`}>
                                            <option value="">Selecione...</option>
                                            <optgroup label="Roupas">
                                                {TAMANHOS_LETRA.map(({ valor, rotulo }) => <option key={valor} value={valor}>{rotulo === "Único" ? "Tamanho Único" : rotulo}</option>)}
                                            </optgroup>
                                            <optgroup label="Numeração (calçados e infantil)">
                                                {TAMANHOS_NUMERICOS.map((numero) => <option key={numero} value={numero}>{numero}</option>)}
                                            </optgroup>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <span className={labelClass}>Condição da peça *</span>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        {CONDICOES.map(({ valor, rotulo }) => (
                                            <label key={valor} className="group flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white p-3 text-sm text-seveste-muted transition-all duration-200 hover:border-seveste-green hover:bg-seveste-green/5 hover:text-seveste-dark has-checked:border-seveste-green has-checked:bg-seveste-green/10 has-checked:text-seveste-dark has-checked:font-semibold has-focus-visible:ring-2 has-focus-visible:ring-seveste-green">
                                                <input
                                                    type="radio"
                                                    name="condition"
                                                    value={valor}
                                                    checked={campos.condicao === valor}
                                                    onChange={atualizar("condicao")}
                                                    className="sr-only"
                                                />
                                                {rotulo}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="color" className={labelClass}>Cor</label>
                                        <input type="text" id="color" value={campos.cor} onChange={atualizar("cor")} placeholder="Ex: Azul marinho" maxLength={40} className={inputClass} />
                                    </div>
                                    <div>
                                        <label htmlFor="material" className={labelClass}>Material</label>
                                        <input type="text" id="material" value={campos.material} onChange={atualizar("material")} placeholder="Ex: Lã, algodão..." maxLength={40} className={inputClass} />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="description" className={labelClass}>Descrição *</label>
                                    <textarea
                                        id="description"
                                        rows={4}
                                        value={campos.descricao}
                                        onChange={atualizar("descricao")}
                                        maxLength={300}
                                        required
                                        placeholder="Conte um pouco sobre a peça, detalhes de tecido, modelagem ou motivo da doação..."
                                        className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-base outline-none transition-colors duration-200 hover:border-seveste-green focus:border-seveste-green focus:ring-1 focus:ring-seveste-green"
                                    />
                                </div>
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* Seção de Entrega */}
                        <section>
                            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                                <Truck className="h-5 w-5 text-seveste-accent" />
                                Entrega
                            </h2>

                            <span className={labelClass}>Como a peça vai chegar até a pessoa? *</span>
                            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {TIPOS_ENTREGA.map(({ valor, rotulo }) => (
                                    <label key={valor} className="group flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white p-3 text-sm text-seveste-muted transition-all duration-200 hover:border-seveste-green hover:bg-seveste-green/5 hover:text-seveste-dark has-checked:border-seveste-green has-checked:bg-seveste-green/10 has-checked:text-seveste-dark has-checked:font-semibold has-focus-visible:ring-2 has-focus-visible:ring-seveste-green">
                                        <input
                                            type="radio"
                                            name="delivery"
                                            value={valor}
                                            checked={campos.tipo_de_entrega === valor}
                                            onChange={atualizar("tipo_de_entrega")}
                                            className="sr-only"
                                        />
                                        {rotulo}
                                    </label>
                                ))}
                            </div>

                            <div>
                                <label htmlFor="location" className={labelClass}>
                                    <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-seveste-accent" /> Bairro ou região aproximada (aparece no anúncio)</span>
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    value={campos.local}
                                    onChange={atualizar("local")}
                                    maxLength={80}
                                    placeholder="Ex: Centro, Vila dos Lavradores..."
                                    className={inputClass}
                                />
                                <p className="mt-2 flex items-center gap-1.5 text-xs text-seveste-muted">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    Por segurança, não informe seu endereço completo aqui.
                                </p>
                                {usuario && (
                                    <p className="mt-1 text-xs text-seveste-muted">
                                        A cidade exibida no anúncio será a do seu cadastro: <strong>{usuario.cidade} - {usuario.uf}</strong>.
                                    </p>
                                )}
                            </div>
                        </section>

                        {erro && <ErrorMessage mensagem={erro} />}

                        <div className="flex flex-col gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={enviando || preparandoFotos}
                                className="w-full rounded-lg border border-seveste-dark bg-seveste-dark px-6 py-4 font-sans text-base font-semibold tracking-wide text-seveste-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-seveste-green hover:bg-seveste-green hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seveste-green disabled:cursor-wait disabled:opacity-60"
                            >
                                {enviando ? "Salvando..." : idEdicao ? "Salvar alterações" : "Publicar doação"}
                            </button>
                            {idEdicao && (
                                <Link href="/dashboard" className="text-center text-sm font-medium text-seveste-muted hover:text-seveste-dark">
                                    Cancelar
                                </Link>
                            )}
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
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-seveste-green" />
                                    <span>Evite fotos que mostrem rostos, documentos ou a fachada da sua casa.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-6">
                            <h3 className="font-bold text-seveste-dark mb-2">O que acontece agora?</h3>
                            <p className="text-sm text-seveste-muted leading-relaxed">
                                Seu anúncio ficará visível na vitrine. Pessoas interessadas enviarão uma solicitação, que aparece em Minha Conta. Ao aceitar uma delas, você recebe o contato e o endereço da pessoa para fazer a entrega.
                            </p>
                        </div>
                    </aside>

                </div>
            </main>
        </div>
    )
}
