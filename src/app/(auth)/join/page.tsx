"use client"

import DonorForm from "@/components/DonorForm"
import RecipientForm from "@/components/RecipientForm"
import { HeartHandshake, Search, Shirt } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Role = "donor" | "recipient" | null

export default function JoinPage() {
    const [selectedRole, setSelectedRole] = useState<Role>(null)
    const router = useRouter()

    if (selectedRole === "donor") {
        return (
            <main className="min-h-screen bg-seveste-cream px-4 py-10 sm:px-6">
                <DonorForm onBack={() => setSelectedRole(null)} />
            </main>
        )
    }

    if (selectedRole === "recipient") {
        return (
            <main className="min-h-screen bg-seveste-cream px-4 py-10 sm:px-6">
                <RecipientForm onBack={() => setSelectedRole(null)} />
            </main>
        )
    }

    const choices = [
        {
            title: "Quero conhecer",
            description: "Explore o Seveste e descubra como a comunidade funciona.",
            icon: Search,
            action: () => router.push("/"),
        },
        {
            title: "Quero doar",
            description: "Compartilhe peças em bom estado com quem precisa.",
            icon: Shirt,
            action: () => setSelectedRole("donor"),
        },
        {
            title: "Quero receber",
            description: "Encontre roupas que façam sentido para sua necessidade.",
            icon: HeartHandshake,
            action: () => setSelectedRole("recipient"),
        },
    ]

    return (
        <main className="flex min-h-screen items-center justify-center bg-seveste-cream px-4 py-12 sm:px-6">
            <section className="w-full max-w-5xl">
                <div className="mx-auto mb-10 max-w-2xl text-center">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-seveste-green">
                        Bem-vindo ao Seveste
                    </p>
                    <h1 className="text-4xl font-semibold tracking-tight text-seveste-dark sm:text-5xl">
                        Como você quer participar?
                    </h1>
                    <p className="mt-4 text-base leading-7 text-seveste-muted sm:text-lg">
                        Escolha o caminho que combina com você. É possível conhecer a plataforma antes de criar uma conta.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                    {choices.map(({ title, description, icon: Icon, action }, index) => (
                        <button
                            key={title}
                            type="button"
                            onClick={action}
                            className={`group cursor-pointer rounded-3xl border p-7 text-left transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(23,63,53,0.13)] ${index === 1 ? "border-seveste-green bg-seveste-green text-seveste-white" : "border-seveste-sage/30 bg-seveste-white text-seveste-text"}`}
                        >
                            <span
                                className={`mb-8 inline-flex rounded-2xl p-3 ${index === 1 ? "bg-seveste-white/15" : "bg-seveste-surface text-seveste-dark"}`}
                            >
                                <Icon size={28} />
                            </span>
                            <span className="block text-xl font-semibold">
                                {title}
                            </span>
                            <span
                                className={`mt-2 block text-sm leading-6 ${index === 1 ? "text-seveste-white/80" : "text-seveste-muted"}`}
                            >
                                {description}
                            </span>
                        </button>
                    ))}
                </div>
            </section>
        </main>
    )
}
