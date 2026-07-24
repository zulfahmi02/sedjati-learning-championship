import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
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
                    <AppLogoIcon className="size-14 rounded-2xl object-contain shadow-md" />
                </Link>

                <div className="flex flex-col gap-6">
                    <div className="rounded-[2rem] border-2 border-leaf/10 bg-white p-6 shadow-[0_5px_0_rgba(42,51,31,0.08)] sm:p-8 dark:bg-card">
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
