"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Download, LogOut, Save, ShieldCheck, Trash2, UserCog } from "lucide-react"
import { useAuth } from "./AuthProvider"
import { ErrorMessage } from "./Feedback"
import { api, mensagemDeErro } from "@/lib/api"
import { NECESSIDADES, UFS } from "@/lib/constants"
import { dataCurta } from "@/lib/format"
import type { Usuario } from "@/lib/types"

const inputClass = "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base outline-none transition-colors duration-200 hover:border-seveste-green focus:border-seveste-green focus:ring-1 focus:ring-seveste-green"
const labelClass = "mb-1.5 block text-sm font-medium text-seveste-dark"

// Aba "Meus dados": permite ao titular corrigir, exportar e excluir seus dados (direitos da LGPD, art. 18)
export default function AccountSettings({ usuario }: { usuario: Usuario }) {
    const { definirUsuario, sair } = useAuth()
    const router = useRouter()

    const [salvando, setSalvando] = useState(false)
    const [mensagem, setMensagem] = useState<string | null>(null)
    const [erro, setErro] = useState<string | null>(null)
    const [confirmacao, setConfirmacao] = useState("")
    const [excluindo, setExcluindo] = useState(false)
    const [exportando, setExportando] = useState(false)

    const ehAcolhido = usuario.tipo === "acolhido"

    const handleSalvar = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const dados = new FormData(event.currentTarget)

        const corpo: Record<string, unknown> = {
            nome: dados.get("nome"),
            telefone: dados.get("telefone"),
            rua: dados.get("rua"),
            numero: dados.get("numero"),
            complemento: dados.get("complemento"),
            cidade: dados.get("cidade"),
            uf: dados.get("uf"),
            bio: dados.get("bio"),
        }

        if (ehAcolhido) {
            const necessidades = dados.getAll("necessidades").map(String)
            if (necessidades.length === 0) {
                setErro("Selecione pelo menos um item que você procura.")
                return
            }
            corpo.roupas_procuradas = necessidades
            corpo.tamanho_roupa = dados.get("tamanho_roupa")
            corpo.tamanho_calcado = Number(dados.get("tamanho_calcado"))
        }

        setSalvando(true)
        setErro(null)
        setMensagem(null)
        try {
            const atualizado = await api<Usuario>(`/usuarios/${usuario.id_usuario}`, { method: "PATCH", body: corpo })
            definirUsuario(atualizado)
            setMensagem("Dados atualizados com sucesso.")
        } catch (e) {
            setErro(mensagemDeErro(e))
        } finally {
            setSalvando(false)
        }
    }

    const handleExportar = async () => {
        setExportando(true)
        setErro(null)
        try {
            const dados = await api("/usuarios/me/dados")
            const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = "meus-dados-seveste.json"
            link.click()
            URL.revokeObjectURL(url)
        } catch (e) {
            setErro(mensagemDeErro(e))
        } finally {
            setExportando(false)
        }
    }

    const handleExcluir = async () => {
        setExcluindo(true)
        setErro(null)
        try {
            await api(`/usuarios/${usuario.id_usuario}`, { method: "DELETE" })
            await sair()
            router.replace("/")
        } catch (e) {
            setErro(mensagemDeErro(e))
            setExcluindo(false)
        }
    }

    const handleSair = async () => {
        await sair()
        router.replace("/")
    }

    return (
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <form onSubmit={handleSalvar} className="flex-1 space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                    <UserCog className="h-5 w-5 text-seveste-green" />
                    Dados da conta
                </h2>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label htmlFor="nome" className={labelClass}>Nome completo</label>
                        <input id="nome" name="nome" defaultValue={usuario.nome} required className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="email" className={labelClass}>E-mail</label>
                        <input id="email" value={usuario.email} disabled className={`${inputClass} cursor-not-allowed bg-slate-50 text-seveste-muted`} />
                    </div>
                    <div>
                        <label htmlFor="telefone" className={labelClass}>Telefone (opcional)</label>
                        <input id="telefone" name="telefone" type="tel" defaultValue={usuario.telefone} className={inputClass} />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="rua" className={labelClass}>Rua</label>
                        <input id="rua" name="rua" defaultValue={usuario.rua} maxLength={500} required autoComplete="address-line1" className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="numero" className={labelClass}>Número</label>
                        <input id="numero" name="numero" defaultValue={usuario.numero} maxLength={20} required className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="complemento" className={labelClass}>Complemento (opcional)</label>
                        <input id="complemento" name="complemento" defaultValue={usuario.complemento} maxLength={100} autoComplete="address-line2" className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="cidade" className={labelClass}>Cidade</label>
                        <input id="cidade" name="cidade" defaultValue={usuario.cidade} required className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="uf" className={labelClass}>Estado</label>
                        <select id="uf" name="uf" defaultValue={usuario.uf} className={`${inputClass} cursor-pointer`}>
                            {UFS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="bio" className={labelClass}>Sobre você (aparece no seu perfil público)</label>
                        <textarea
                            id="bio"
                            name="bio"
                            rows={3}
                            maxLength={500}
                            defaultValue={usuario.bio}
                            placeholder="Conte um pouco sobre você..."
                            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-base outline-none transition-colors duration-200 hover:border-seveste-green focus:border-seveste-green focus:ring-1 focus:ring-seveste-green"
                        />
                    </div>

                    {ehAcolhido && (
                        <>
                            <fieldset className="md:col-span-2">
                                <legend className={labelClass}>O que você procura?</legend>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {NECESSIDADES.map(({ valor, rotulo }) => (
                                        <label key={valor} className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm transition hover:border-seveste-green">
                                            <input
                                                type="checkbox"
                                                name="necessidades"
                                                value={valor}
                                                defaultChecked={usuario.roupas_procuradas?.includes(valor)}
                                                className="size-4 accent-seveste-green"
                                            />
                                            {rotulo}
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                            <div>
                                <label htmlFor="tamanho_roupa" className={labelClass}>Tamanho de roupa</label>
                                <input id="tamanho_roupa" name="tamanho_roupa" defaultValue={usuario.tamanho_roupa} maxLength={10} required className={inputClass} />
                            </div>
                            <div>
                                <label htmlFor="tamanho_calcado" className={labelClass}>Número do calçado</label>
                                <input id="tamanho_calcado" name="tamanho_calcado" type="number" min={15} max={50} defaultValue={usuario.tamanho_calcado || ""} required className={inputClass} />
                            </div>
                        </>
                    )}
                </div>

                {erro && <ErrorMessage mensagem={erro} />}
                {mensagem && <p className="rounded-lg border border-seveste-green/30 bg-seveste-green/10 px-4 py-3 text-sm text-seveste-dark" role="status">{mensagem}</p>}

                <button
                    type="submit"
                    disabled={salvando}
                    className="flex items-center justify-center gap-2 rounded-lg bg-seveste-dark px-6 py-3 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-seveste-green disabled:cursor-wait disabled:opacity-60"
                >
                    <Save className="h-4 w-4" />
                    {salvando ? "Salvando..." : "Salvar alterações"}
                </button>
            </form>

            <aside className="flex w-full shrink-0 flex-col gap-6 lg:w-96">
                <div className="rounded-2xl bg-seveste-dark p-6 text-seveste-white">
                    <div className="mb-4 flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-seveste-accent" />
                        <h3 className="font-bold">Privacidade e seus dados</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-seveste-surface">
                        Você concordou com a{" "}
                        <Link href="/privacy-policy" className="underline hover:text-seveste-accent">política de privacidade</Link>
                        {usuario.consentimento_em && <> em {dataCurta(usuario.consentimento_em)}</>}
                        {usuario.versao_politica && <> (versão {usuario.versao_politica})</>}.
                        Seu e-mail, telefone e endereço nunca são exibidos publicamente: eles só são compartilhados com a outra
                        pessoa de uma doação depois que o doador aceita a solicitação.
                    </p>
                    <button
                        type="button"
                        onClick={handleExportar}
                        disabled={exportando}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-3 text-sm font-semibold transition-colors hover:bg-white/20 disabled:opacity-60"
                    >
                        <Download className="h-4 w-4" />
                        {exportando ? "Gerando arquivo..." : "Baixar uma cópia dos meus dados"}
                    </button>
                </div>

                <div className="rounded-2xl border border-red-200 bg-white p-6">
                    <h3 className="mb-2 flex items-center gap-2 font-bold text-red-700">
                        <Trash2 className="h-4 w-4" />
                        Excluir minha conta
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-seveste-muted">
                        Remove definitivamente sua conta, endereço, anúncios, fotos, solicitações e avaliações. Essa ação não pode ser desfeita.
                    </p>
                    <label htmlFor="confirmar-exclusao" className="mb-1.5 block text-xs font-medium text-seveste-dark">
                        Digite <strong>EXCLUIR</strong> para confirmar
                    </label>
                    <input
                        id="confirmar-exclusao"
                        value={confirmacao}
                        onChange={(e) => setConfirmacao(e.target.value)}
                        className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                    <button
                        type="button"
                        onClick={handleExcluir}
                        disabled={confirmacao !== "EXCLUIR" || excluindo}
                        className="w-full rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {excluindo ? "Excluindo..." : "Excluir conta permanentemente"}
                    </button>
                </div>

                <button
                    type="button"
                    onClick={handleSair}
                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-3 text-sm font-semibold text-seveste-dark transition-all hover:bg-slate-50 hover:text-seveste-green"
                >
                    <LogOut className="h-4 w-4" />
                    Sair da conta
                </button>
            </aside>
        </div>
    )
}
