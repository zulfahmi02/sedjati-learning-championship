import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Blob } from '@/components/slc/blob';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative isolate flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-b from-butter to-[#FFFDF6] p-6 text-deep [--background:#FFFDF6] [--border:#D9E3D1] [--card-foreground:#2A331F] [--card:#FFFFFF] [--foreground:#2A331F] [--input:#78946C] [--muted-foreground:#56644B] [--muted:#FFF3D6] [--primary-foreground:#FFFFFF] [--primary:#4F9A46] [--ring:#4F9A46] md:p-10">
            <Blob className="-top-12 -right-20 size-52 bg-sun" />
            <Blob className="-bottom-12 -left-20 size-44 bg-papaya opacity-35" />
            <div className="relative w-full max-w-md">
                <section className="relative overflow-hidden rounded-[2rem] border-2 border-leaf/15 bg-white/90 p-6 shadow-[0_8px_0_rgba(42,51,31,0.08)] backdrop-blur-sm sm:p-8">
                    <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-leaf via-sun to-papaya" />
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col items-center gap-4">
                            <Link
                                href={home()}
                                className="flex flex-col items-center gap-2 rounded-2xl font-medium focus-visible:outline-leaf"
                            >
                                <AppLogoIcon className="mb-1 size-16 rounded-2xl object-contain drop-shadow-[0_4px_4px_rgba(42,51,31,0.18)]" />
                                <span className="sr-only">{title}</span>
                            </Link>

                            <div className="max-w-sm space-y-2 text-center">
                                <h1 className="font-heading text-3xl leading-tight font-extrabold text-deep sm:text-4xl">
                                    {title}
                                </h1>
                                <p className="text-center text-base leading-6 font-semibold text-deep/75">
                                    {description}
                                </p>
                            </div>
                        </div>
                        {children}
                    </div>
                </section>
            </div>
        </div>
    );
}
