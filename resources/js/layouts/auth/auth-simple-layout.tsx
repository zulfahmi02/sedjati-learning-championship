import { Link } from '@inertiajs/react';
import { Blob } from '@/components/slc/blob';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-b from-butter to-[#FFFDF6] p-6 md:p-10">
            <Blob className="-top-12 -right-20 size-52 bg-sun" />
            <Blob className="-bottom-12 -left-20 size-44 bg-papaya opacity-35" />
            <div className="relative w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="mb-1 flex size-12 items-center justify-center rounded-2xl bg-leaf shadow-md">
                                <span className="text-2xl">🌿</span>
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="font-heading text-3xl font-bold text-deep">
                                {title}
                            </h1>
                            <p className="text-center text-sm font-semibold text-ink/70">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
