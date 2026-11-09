"use client"

import Image from "next/image"
import Link from "next/link"
import { LogOut, Menu } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./AuthProvider"

const solidButton = "cursor-pointer border border-seveste-surface bg-seveste-surface px-5 py-2.5 font-sans text-lg font-semibold text-seveste-dark shadow-sm transition duration-200 hover:-translate-y-px hover:border-seveste-accent hover:bg-seveste-accent hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seveste-accent"
const outlineButton = "cursor-pointer border border-seveste-surface/70 bg-transparent px-5 py-2.5 font-sans text-lg font-semibold text-seveste-white transition duration-200 hover:-translate-y-px hover:border-seveste-accent hover:bg-seveste-accent/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seveste-accent"
const mobileLink = "px-4 py-3 text-left font-sans font-semibold text-seveste-white hover:bg-seveste-green"

export default function Navbar() {
    const [isVisible, setIsVisible] = useState(false)
    const { usuario, carregando, sair } = useAuth()
    const router = useRouter()

    useEffect(() => {
        const handleScroll = () => setIsVisible(window.scrollY > 24)

        handleScroll()
        window.addEventListener("scroll", handleScroll)

        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const handleLogout = async () => {
        await sair()
        router.push("/")
    }

    const links = usuario
        ? [
            { href: "/products", label: "Vitrine" },
            ...(usuario.tipo === "doador" ? [{ href: "/announce", label: "Anunciar" }] : []),
            { href: "/dashboard", label: "Minha conta" },
        ]
        : [
            { href: "/login", label: "Entrar" },
            { href: "/join?role=donor", label: "Quero doar" },
            { href: "/join?role=recipient", label: "Quero receber" },
        ]

    return (
        <nav className={`fixed inset-x-0 top-0 z-20 flex items-center justify-between bg-seveste-dark px-4 py-3 shadow-lg transition-transform duration-300 md:px-15 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}>
            <details className="relative md:hidden">
                <summary
                    className="flex size-11 cursor-pointer list-none items-center justify-center text-seveste-white [&::-webkit-details-marker]:hidden"
                    aria-label="Abrir menu"
                >
                    <Menu size={30} />
                </summary>

                <div className="absolute left-0 top-full mt-3 flex w-52 flex-col border border-seveste-sage bg-seveste-dark p-2 shadow-lg">
                    {!carregando && links.map(({ href, label }) => (
                        <Link key={href} href={href} className={mobileLink}>
                            {label}
                        </Link>
                    ))}
                    {usuario && (
                        <button type="button" onClick={handleLogout} className={`${mobileLink} cursor-pointer`}>
                            Sair
                        </button>
                    )}
                </div>
            </details>

            <Link
                href="/"
                className="absolute left-1/2 flex -translate-x-1/2 cursor-pointer items-center md:static md:translate-x-0"
            >
                <Image
                    src="/icons/sevesteHangerIcon.png"
                    alt="Ícone do Seveste"
                    width={56}
                    height={56}
                    className="size-11 bg-seveste-surface object-contain md:size-14"
                    loading="eager"
                />
                <span className="ml-2 font-display text-3xl text-seveste-white md:text-4xl">Seveste</span>
            </Link>

            <div className="hidden items-center gap-3 md:flex">
                {!carregando && links.map(({ href, label }, index) => {
                    // o último link é a ação principal (botão sólido); "Entrar" aparece como texto
                    if (!usuario && index === 0) {
                        return (
                            <Link key={href} href={href} className="px-3 py-2.5 font-sans text-lg font-semibold text-seveste-white transition hover:text-seveste-accent">
                                {label}
                            </Link>
                        )
                    }

                    const isPrimary = usuario ? index === links.length - 1 : index === 1
                    return (
                        <Link key={href} href={href} className={isPrimary ? solidButton : outlineButton}>
                            {label}
                        </Link>
                    )
                })}

                {usuario && (
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex size-11 cursor-pointer items-center justify-center text-seveste-white transition hover:text-seveste-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seveste-accent"
                        aria-label="Sair da conta"
                        title="Sair"
                    >
                        <LogOut size={22} />
                    </button>
                )}
            </div>

            <div className="size-11 md:hidden" aria-hidden="true" />
        </nav>
    )
}
