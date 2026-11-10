import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Termos de Uso | Seveste",
}

export default function TermsOfUse() {
    return (
        <>
            <h1 className="mb-6 text-4xl font-bold text-seveste-dark">Termos de Uso</h1>

            <p>
                Ao usar o Seveste você concorda com estes termos. O Seveste é um projeto acadêmico da FATEC Botucatu, gratuito e sem fins
                lucrativos, que conecta pessoas que querem doar roupas a pessoas que precisam recebê-las.
            </p>

            <h2>1. Cadastro</h2>
            <ul>
                <li>Você deve ter 18 anos ou mais e fornecer informações verdadeiras.</li>
                <li>Você é responsável por manter sua senha em segredo e pelas ações realizadas na sua conta.</li>
                <li>Contas de <strong>doadores</strong> podem publicar anúncios; contas de <strong>acolhidos</strong> podem solicitar doações.</li>
            </ul>

            <h2>2. Anúncios e doações</h2>
            <ul>
                <li>As doações são sempre gratuitas. É proibido cobrar qualquer valor ou pedir algo em troca.</li>
                <li>Anuncie apenas peças limpas, em condições de uso, e descreva defeitos com honestidade.</li>
                <li>Não publique conteúdo ofensivo, ilegal ou que exponha dados pessoais de terceiros.</li>
                <li>Cada anúncio informa como a peça será entregue: levada pelo doador ou enviada por frete. Quem paga o frete deve ser combinado entre as pessoas antes do envio.</li>
                <li>Os dados de contato e o endereço recebidos após o aceite de uma solicitação só podem ser usados para combinar aquela doação.</li>
            </ul>

            <h2>3. Responsabilidades</h2>
            <p>
                O Seveste oferece apenas o espaço de conexão e não participa da entrega das peças. Não nos responsabilizamos pelo estado dos
                itens ou por combinações feitas entre os usuários. Contas que violarem estes termos poderão ser removidas.
            </p>

            <h2>4. Privacidade</h2>
            <p>
                O tratamento dos seus dados pessoais é descrito na <Link href="/privacy-policy" className="font-semibold text-seveste-green underline">Política de Privacidade</Link>.
            </p>

            <h2>5. Alterações</h2>
            <p>Estes termos podem ser atualizados. Mudanças relevantes serão comunicadas na plataforma.</p>
        </>
    )
}
