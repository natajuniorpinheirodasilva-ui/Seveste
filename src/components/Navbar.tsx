"use client"

import Image from "next/image"
import Link from "next/link"
import { Menu } from "lucide-react"
import { useEffect, useState } from "react"

export default function Navbar() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const handleScroll = () => setIsVisible(window.scrollY > 24)

        handleScroll()
        window.addEventListener("scroll", handleScroll)

        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

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
                    <Link
                        href="/join?role=donor"
                        className="px-4 py-3 font-sans font-semibold text-seveste-white hover:bg-seveste-green"
                    >
                        Quero doar
                    </Link>
                    <Link
                        href="/join?role=recipient"
                        className="px-4 py-3 font-sans font-semibold text-seveste-white hover:bg-seveste-green"
                    >
                        Quero receber
                    </Link>
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
                <Link
                    href="/join?role=donor"
                    className="cursor-pointer border border-seveste-surface bg-seveste-surface px-5 py-2.5 font-sans text-lg font-semibold text-seveste-dark shadow-sm transition duration-200 hover:-translate-y-px hover:border-seveste-accent hover:bg-seveste-accent hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seveste-accent"
                >
                    Quero doar
                </Link>

                <Link
                    href="/join?role=recipient"
                    className="cursor-pointer border border-seveste-surface/70 bg-transparent px-5 py-2.5 font-sans text-lg font-semibold text-seveste-white transition duration-200 hover:-translate-y-px hover:border-seveste-accent hover:bg-seveste-accent/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seveste-accent"
                >
                    Quero receber
                </Link>
            </div>

            <div className="size-11 md:hidden" aria-hidden="true" />
        </nav>
    )
}
