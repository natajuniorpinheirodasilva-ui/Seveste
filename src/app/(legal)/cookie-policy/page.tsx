import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Política de Cookies | Seveste",
}

export default function CookiePolicy() {
    return (
        <>
            <h1 className="mb-6 text-4xl font-bold text-seveste-dark">Política de Cookies</h1>

            <p>
                O Seveste usa somente o mínimo necessário para funcionar. Não utilizamos cookies de publicidade, de rastreamento
                ou de ferramentas de análise de terceiros.
            </p>

            <h2>Cookie essencial</h2>
            <ul>
                <li>
                    <strong>seveste_token</strong> — mantém você conectado após o login. É protegido contra leitura por scripts (httpOnly),
                    expira em 6 horas e é apagado quando você sai da conta ou a exclui.
                </li>
            </ul>
            <p>Por ser estritamente necessário para o login, esse cookie não depende de consentimento separado. Sem ele não é possível acessar a sua conta.</p>

            <h2>Armazenamento local do navegador</h2>
            <p>Não guardamos dados pessoais no armazenamento local do seu navegador.</p>
        </>
    )
}
