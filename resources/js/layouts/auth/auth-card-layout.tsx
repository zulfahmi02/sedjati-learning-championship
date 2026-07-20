import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { Blob } from '@/components/slc/blob';
import { home } from '@/routes';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-b from-butter to-[#FFFDF6] p-6 md:p-10">
            <Blob className="-top-12 -right-20 size-52 bg-sun" />
            <Blob className="-bottom-12 -left-20 size-44 bg-papaya opacity-35" />
            <div className="relative flex w-full max-w-md flex-col gap-6">
                <Link
                    href={home()}
                    className="flex items-center gap-2 self-center font-medium"
                >
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-leaf shadow-md">
                        <span className="text-2xl">🌿</span>
                    </div>
                </Link>

                <div className="flex flex-col gap-6">
                    <div className="rounded-2xl border-2 border-leaf/10 bg-white p-8 shadow-sm">
                        {title && (
                            <div className="mb-6 text-center">
                                <h2 className="font-heading text-2xl font-bold text-deep">
                                    {title}
                                </h2>
                                {description && (
                                    <p className="mt-1 text-sm font-semibold text-ink/70">
                                        {description}
                                    </p>
                                )}
                            </div>
                        )}
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
