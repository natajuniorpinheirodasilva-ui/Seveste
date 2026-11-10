import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Política de Privacidade | Seveste",
}

// Ao alterar este texto de forma relevante, atualize também VersaoPoliticaPrivacidade na API
export default function PrivacyPolicy() {
    return (
        <>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-seveste-green">Versão 2026-11.2</p>
            <h1 className="mb-6 mt-2 text-4xl font-bold text-seveste-dark">Política de Privacidade</h1>

            <p>
                O Seveste é um projeto acadêmico desenvolvido na FATEC Botucatu para aproximar pessoas que desejam doar roupas
                de pessoas que precisam recebê-las. Esta política explica, em linguagem simples, quais dados pessoais tratamos,
                por que tratamos e quais são os seus direitos, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
            </p>

            <h2>1. Quais dados coletamos</h2>
            <ul>
                <li><strong>Cadastro:</strong> nome, e-mail, senha (armazenada apenas de forma criptografada), endereço completo (rua, número, complemento, cidade e estado) e, opcionalmente, telefone.</li>
                <li><strong>Somente para acolhidos:</strong> tipos de peças procuradas, tamanho de roupa e número de calçado, usados para encontrar doações compatíveis.</li>
                <li><strong>Uso da plataforma:</strong> anúncios e fotos publicados, solicitações de doação, itens salvos e avaliações.</li>
                <li><strong>Registro de consentimento:</strong> data e versão desta política aceitas no cadastro.</li>
            </ul>
            <p>
                Coletamos apenas o necessário para o funcionamento da plataforma (princípio da necessidade). O endereço completo é pedido porque
                as peças são levadas pelo doador ou enviadas por frete até quem vai recebê-las. Não pedimos documentos nem dados bancários.
            </p>

            <h2>2. Para que usamos os dados</h2>
            <ul>
                <li>Criar e manter sua conta e sua sessão de acesso.</li>
                <li>Exibir anúncios na vitrine e permitir que doadores e acolhidos combinem a entrega da peça.</li>
                <li>Mostrar a reputação de cada pessoa por meio das avaliações.</li>
            </ul>
            <p>
                A base legal é o seu <strong>consentimento</strong> (art. 7º, I) e a <strong>execução do serviço</strong> que você solicitou (art. 7º, V).
                Seus dados não são vendidos, não são usados para publicidade e não são compartilhados com terceiros.
            </p>

            <h2>3. O que fica visível para outras pessoas</h2>
            <p>
                No seu perfil público aparecem apenas nome, cidade, estado, tipo de conta, a apresentação que você escrever, seus anúncios ativos
                e as avaliações recebidas. <strong>E-mail, telefone, endereço e dados de tamanho nunca são exibidos publicamente.</strong>
            </p>
            <p>
                Quando um doador <strong>aceita</strong> uma solicitação, os dados de contato passam a ser compartilhados apenas entre as duas
                pessoas daquela doação: o doador recebe nome, e-mail, telefone e endereço completo de quem vai receber a peça (para levá-la ou
                enviá-la por frete), e quem vai receber vê o nome, e-mail e telefone do doador. Esses dados devem ser usados somente para combinar a entrega.
            </p>
            <p>Recomendamos não enviar fotos que mostrem rostos, documentos ou a fachada da sua casa e não informar seu endereço completo nos anúncios.</p>

            <h2>4. Por quanto tempo guardamos</h2>
            <p>
                Os dados ficam armazenados enquanto sua conta existir. Ao excluir a conta, removemos seus dados de cadastro, endereço, anúncios,
                fotos, solicitações, itens salvos e avaliações. Por ser um projeto acadêmico, o ambiente de testes pode ser reiniciado, apagando todos os dados.
            </p>

            <h2>5. Seus direitos</h2>
            <p>A LGPD (art. 18) garante a você, entre outros, os direitos de:</p>
            <ul>
                <li><strong>Acessar e levar seus dados:</strong> em <Link href="/dashboard?aba=dados" className="font-semibold text-seveste-green underline">Minha Conta → Meus dados</Link>, use &ldquo;Baixar uma cópia dos meus dados&rdquo;.</li>
                <li><strong>Corrigir dados:</strong> edite suas informações na mesma aba a qualquer momento.</li>
                <li><strong>Excluir seus dados e revogar o consentimento:</strong> use &ldquo;Excluir minha conta&rdquo;. A exclusão é imediata e definitiva.</li>
                <li><strong>Obter informações</strong> sobre o tratamento e o compartilhamento dos seus dados, como descrito nesta página.</li>
            </ul>

            <h2>6. Segurança</h2>
            <p>
                Senhas são armazenadas com hash criptográfico (bcrypt), a sessão usa um cookie protegido contra acesso por scripts e cada
                operação verifica se você tem permissão sobre o recurso. Nenhum sistema é totalmente imune a falhas; caso ocorra um incidente
                relevante, os usuários afetados serão comunicados.
            </p>

            <h2>7. Crianças e adolescentes</h2>
            <p>O cadastro é destinado a maiores de 18 anos. Doações para crianças devem ser solicitadas pelos pais ou responsáveis.</p>

            <h2>8. Cookies</h2>
            <p>
                Usamos apenas um cookie essencial para manter você conectado. Veja a <Link href="/cookie-policy" className="font-semibold text-seveste-green underline">Política de Cookies</Link>.
            </p>

            <h2>9. Contato e alterações</h2>
            <p>
                Dúvidas ou solicitações sobre seus dados podem ser encaminhadas à equipe responsável pelo projeto Seveste na FATEC Botucatu.
                Se esta política mudar de forma relevante, avisaremos na plataforma e a nova versão passará a ser indicada no topo desta página.
            </p>
        </>
    )
}
