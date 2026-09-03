import { ArrowLeft, HeartHandshake } from "lucide-react"
import Input from "./Input"

type DonorFormProps = {
    onBack: () => void
}

export default function DonorForm({ onBack }: DonorFormProps) {
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
                <span className="bg-seveste-green p-3 text-seveste-white">
                    <HeartHandshake size={28} />
                </span>
                <div>
                    <p className="mb-1 text-sm font-semibold uppercase tracking-[0.2em] text-seveste-accent">
                        Quero compartilhar
                    </p>
                    <h1 className="text-3xl font-semibold text-seveste-dark">
                        Cadastro de doador
                    </h1>
                    <p className="mt-2 text-base text-seveste-muted">
                        Conte o essencial agora. Os detalhes das peças ficam para a próxima etapa.
                    </p>
                </div>
            </div>

            <form className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <Input
                        label="Nome completo"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Como podemos chamar você?"
                        required
                    />
                </div>
                <Input
                    label="E-mail"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="voce@exemplo.com"
                    required
                />
                <Input
                    label="Senha"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Mínimo de 8 caracteres"
                    minLength={8}
                    required
                />
                <Input
                    label="Cidade"
                    name="city"
                    type="text"
                    autoComplete="address-level2"
                    placeholder="Sua cidade"
                    required
                />
                <Input
                    label="Estado"
                    name="state"
                    type="text"
                    autoComplete="address-level1"
                    placeholder="UF"
                    maxLength={2}
                    required
                />
                <div className="sm:col-span-2">
                    <Input
                        label="Telefone (opcional)"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="Usaremos apenas para combinar a entrega"
                    />
                </div>

                <label className="flex items-start gap-3 text-sm leading-6 text-seveste-muted sm:col-span-2">
                    <input
                        type="checkbox"
                        name="privacy"
                        required
                        className="mt-1 size-4 accent-seveste-green"
                    />
                    Li o aviso de privacidade e concordo com o uso dos meus dados para viabilizar as doações.
                </label>

                <button
                    type="submit"
                    className="mt-2 cursor-pointer border border-seveste-green bg-seveste-green px-6 py-3 font-semibold text-seveste-white shadow-sm transition duration-200 hover:-translate-y-px hover:border-seveste-dark hover:bg-seveste-dark hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seveste-green sm:col-span-2"
                >
                    Continuar como doador
                </button>
            </form>
        </section>
    )
}
