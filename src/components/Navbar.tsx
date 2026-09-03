import Image from "next/image"
import Link from "next/link"

export default function Navbar() {
    return (
        <div className="flex items-center justify-between bg-seveste-dark px-15 py-3 shadow-lg">
            <Image
                src="/sevesteHangerIcon.png"
                alt="Ícone do Seveste"
                width={56}
                height={56}
                className="cursor-pointer object-contain bg-seveste-surface"
            />

            <div className="flex items-center gap-3">
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
        </div>
    )
}
