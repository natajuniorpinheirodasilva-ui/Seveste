"use client"

import { ArrowLeft, HandHeart } from "lucide-react"
import Input from "./Input"
import Link from "next/link"
import { ErrorMessage } from "./Feedback"
import { useSignup } from "@/lib/useSignup"
import { NECESSIDADES } from "@/lib/constants"

type RecipientFormProps = {
    onBack: () => void
}

const clothingNeeds = NECESSIDADES

export default function RecipientForm({ onBack }: RecipientFormProps) {
    const { handleSubmit, enviando, erro } = useSignup("acolhido", (dados) => {
        const necessidades = dados.getAll("needs").map(String)
        if (necessidades.length === 0) return "Selecione pelo menos um item que você procura."

        return {
            roupas_procuradas: necessidades,
            tamanho_roupa: String(dados.get("clothingSize") ?? "").trim(),
            tamanho_calcado: Number(dados.get("shoeSize")),
        }
    })

    return (
        <section className="mx-auto w-full max-w-2xl border border-seveste-sage/30 bg-seveste-white p-6 shadow-[0_24px_70px_rgba(23,63,53,0.12)] sm:p-10">
            <button
                type="button"
                onClick={onBack}
                className="mb-8 flex cursor-pointer items-center gap-2 text-sm font-medium text-seveste-muted transition hover:text-seveste-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-seveste-green"
            >
                <ArrowLeft size={18} />
                Voltar
            </button>

            <div className="mb-8 flex items-start gap-4">
                <span className="bg-seveste-accent p-3 text-seveste-dark">
                    <HandHeart size={28} />
                </span>
                <div>
                    <p className="mb-1 text-sm font-semibold uppercase tracking-[0.2em] text-seveste-green">
                        Quero ser acolhido
                    </p>
                    <h1 className="text-3xl font-semibold text-seveste-dark">
                        Cadastro de acolhido
                    </h1>
                    <p className="mt-2 text-base text-seveste-muted">
                        Informe somente o necessário. Seu endereço só é compartilhado com o doador que aceitar sua solicitação, para a entrega.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <Input
                        label="Nome completo *"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Como podemos chamar você?"
                        required
                    />
                </div>
                <Input
                    label="E-mail *"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="voce@exemplo.com"
                    required
                />
                <Input
                    label="Senha *"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Mínimo de 8 caracteres"
                    minLength={8}
                    required
                />
                <div className="sm:col-span-2">
                    <Input
                        label="Rua *"
                        name="street"
                        type="text"
                        autoComplete="address-line1"
                        placeholder="Rua, avenida..."
                        maxLength={500}
                        required
                    />
                </div>
                <Input
                    label="Número *"
                    name="number"
                    type="text"
                    placeholder="Ex.: 120"
                    maxLength={20}
                    required
                />
                <Input
                    label="Complemento (opcional)"
                    name="complement"
                    type="text"
                    autoComplete="address-line2"
                    placeholder="Apto, bloco, casa..."
                    maxLength={100}
                />
                <Input
                    label="Cidade *"
                    name="city"
                    type="text"
                    autoComplete="address-level2"
                    placeholder="Sua cidade"
                    maxLength={100}
                    required
                />
                <Input
                    label="Estado *"
                    name="state"
                    type="text"
                    autoComplete="address-level1"
                    placeholder="UF"
                    minLength={2}
                    maxLength={2}
                    pattern="[A-Za-z]{2}"
                    title="Informe a sigla do estado, ex.: SP"
                    className="uppercase"
                    required
                />

                <fieldset className="sm:col-span-2">
                    <legend className="mb-3 text-sm font-medium text-seveste-text">
                        O que você procura? *
                    </legend>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {clothingNeeds.map(({ valor, rotulo }) => (
                            <label
                                key={valor}
                                className="flex cursor-pointer items-center gap-2 border border-seveste-sage/50 bg-seveste-cream px-3 py-3 text-sm text-seveste-text transition hover:border-seveste-green"
                            >
                                <input
                                    type="checkbox"
                                    name="needs"
                                    value={valor}
                                    className="size-4 accent-seveste-green"
                                />
                                {rotulo}
                            </label>
                        ))}
                    </div>
                </fieldset>

                <Input
                    label="Tamanho de roupa *"
                    name="clothingSize"
                    type="text"
                    placeholder="Ex.: M, G ou 42"
                    maxLength={10}
                    required
                />
                <Input
                    label="Número do calçado *"
                    name="shoeSize"
                    type="number"
                    inputMode="numeric"
                    min={15}
                    max={50}
                    placeholder="Ex.: 38"
                    required
                />

                <label className="flex items-start gap-3 text-sm leading-6 text-seveste-muted sm:col-span-2">
                    <input
                        type="checkbox"
                        name="privacy"
                        required
                        className="mt-1 size-4 accent-seveste-green cursor-pointer"
                    />
                    <Link
                        className="underline hover:text-seveste-green"
                        href="/privacy-policy"
                        target="_blank">
                        Tenho 18 anos ou mais, li a política de privacidade e concordo com o uso dos meus dados para viabilizar as doações.
                    </Link>
                </label>

                {erro && (
                    <div className="sm:col-span-2">
                        <ErrorMessage mensagem={erro} />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={enviando}
                    className="mt-2 cursor-pointer border border-seveste-green bg-seveste-green px-6 py-3 font-semibold text-seveste-white shadow-sm transition duration-200 hover:-translate-y-px hover:border-seveste-dark hover:bg-seveste-dark hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seveste-green disabled:cursor-wait disabled:opacity-60 sm:col-span-2"
                >
                    {enviando ? "Criando sua conta..." : "Continuar como acolhido"}
                </button>
            </form>
        </section>
    )
}
