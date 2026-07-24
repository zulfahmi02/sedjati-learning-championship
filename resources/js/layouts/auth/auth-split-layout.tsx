import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Blob } from '@/components/slc/blob';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-gradient-to-br from-deep to-deep2 p-10 text-white lg:flex">
                <Blob className="-top-10 -right-10 size-60 bg-sun opacity-20" />
                <Blob className="-bottom-10 -left-10 size-48 bg-papaya opacity-15" />
                <Link
                    href={home()}
                    className="relative z-20 flex items-center gap-2 text-lg font-bold"
                >
                    <AppLogoIcon className="size-10 rounded-xl object-contain shadow-sm" />
                    {name}
                </Link>
                <div className="relative mt-auto">
                    <p className="font-heading text-3xl font-bold text-white/90 italic">
                        "Belajar itu Seru, Semua Anak Juara"
                    </p>
                    <div className="mt-4 text-2xl tracking-widest">
                        🌱🌿🌸🌼🌺🌳
                    </div>
                </div>
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden"
                    >
                        <AppLogoIcon className="size-14 rounded-2xl object-contain shadow-md" />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="font-heading text-2xl font-bold text-deep">
                            {title}
                        </h1>
                        <p className="text-sm font-semibold text-balance text-ink/70">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
