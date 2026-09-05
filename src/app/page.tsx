import Navbar from "@/components/Navbar"
import Image from "next/image"

export default function Home() {
    return (
        <div>
            <div className="flex min-h-dvh flex-col">
                <Navbar />

                <section className="relative flex min-h-128 flex-1 items-center justify-center overflow-hidden">
                    <button
                        className="relative z-10 cursor-pointer border border-seveste-surface bg-seveste-surface px-5 py-2.5 font-sans text-lg font-semibold text-seveste-dark shadow-sm transition duration-200 hover:-translate-y-px hover:border-seveste-accent hover:bg-seveste-accent hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seveste-accent"
                    >
                        Quero doar
                    </button>

                    <button
                        className="ml-2 relative z-10 cursor-pointer border border-seveste-surface/70 bg-transparent px-5 py-2.5 font-sans text-lg font-semibold text-seveste-white transition duration-200 hover:-translate-y-px hover:border-seveste-accent hover:bg-seveste-accent/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seveste-accent"
                    >
                        Quero receber
                    </button>

                    <Image
                        src="/images/hero-banner.png"
                        className="object-cover object-center bg-black/50"
                        alt="Hero Banner"
                        fill
                    />
                    <div className="absolute inset-0 bg-black/50" />
                </section>
            </div>
        </div>
    )
}
