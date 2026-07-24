import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, LogIn } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Blob } from '@/components/slc/blob';
import { dashboard, home, login } from '@/routes';

export default function PublicLayout({
    children,
    eventName = 'SLC Scoring',
    live = false,
}: PropsWithChildren<{ eventName?: string; live?: boolean }>) {
    const { auth } = usePage().props;

    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-gradient-to-b from-butter to-[#FFFDF6] text-deep">
            <Blob className="-top-8 -right-16 size-44 bg-sun" />
            <Blob className="-bottom-10 -left-16 size-36 bg-papaya opacity-35" />

            <header className="fixed top-0 right-0 left-0 z-40 border-b border-white/10 bg-deep/95 text-white shadow-[0_6px_24px_rgba(42,51,31,0.18)] backdrop-blur-md">
                <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-3 px-4 md:px-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href={home()}
                            className="flex items-center gap-2 font-heading text-lg font-bold text-white focus-visible:outline-sun"
                        >
                            <AppLogoIcon className="size-9 rounded-xl object-contain drop-shadow-[0_2px_3px_rgba(0,0,0,0.24)]" />
                            <span className="hidden sm:inline">
                                Sedjati{' '}
                                <span className="text-[#9BE886]">Scoring</span>
                            </span>
                        </Link>
                        <div className="mx-1 hidden h-6 w-px bg-white/20 sm:block" />
                        <span className="hidden text-xs font-bold tracking-widest text-white/80 uppercase sm:block">
                            Leaderboard Publik
                        </span>
                    </div>
                    <div className="flex items-center gap-5">
                        <span className="hidden text-xs font-bold tracking-wider text-[#9BE886] uppercase md:block">
                            {eventName}
                        </span>
                        {live && (
                            <div className="hidden items-center gap-2 border-l border-white/20 pl-5 text-white/80 lg:flex">
                                <span className="inline-block size-2 animate-pulse rounded-full bg-papaya" />
                                <span className="text-xs font-bold tracking-wider">
                                    Live Update
                                </span>
                            </div>
                        )}
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#6BC862] bg-[#397C34] px-4 py-2 font-heading text-sm font-bold text-white shadow-[0_3px_0_rgba(0,0,0,0.24)] transition-all hover:bg-[#438F3D] focus-visible:outline-sun active:translate-y-0.5 active:shadow-[0_1px_0_rgba(0,0,0,0.2)] sm:px-5"
                            >
                                <LayoutGrid className="size-4" />
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={login()}
                                className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#6BC862] bg-[#397C34] px-4 py-2 font-heading text-sm font-bold text-white shadow-[0_3px_0_rgba(0,0,0,0.24)] transition-all hover:bg-[#438F3D] focus-visible:outline-sun active:translate-y-0.5 active:shadow-[0_1px_0_rgba(0,0,0,0.2)] sm:px-5"
                            >
                                <LogIn className="size-4" />
                                Masuk
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pt-28 pb-12 md:px-6">
                {children}
            </main>

            <footer className="border-t border-leaf/15 bg-white/35 py-6">
                <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-3 px-4 md:flex-row md:px-6">
                    <span className="text-xs font-bold tracking-wider text-deep/75">
                        © {new Date().getFullYear()} Sedjati Learning
                        Championship
                    </span>
                    <div className="flex gap-2">
                        <span className="size-3 rounded-full bg-sun" />
                        <span className="size-3 rounded-full bg-leaf" />
                        <span className="size-3 rounded-full bg-papaya" />
                    </div>
                </div>
            </footer>
        </div>
    );
}
