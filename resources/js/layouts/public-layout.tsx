import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, LogIn } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { Blob } from '@/components/slc/blob';
import { dashboard, home, login } from '@/routes';

export default function PublicLayout({
    children,
    eventName = 'SLC Scoring',
    live = false,
}: PropsWithChildren<{ eventName?: string; live?: boolean }>) {
    const { auth } = usePage().props;

    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-gradient-to-b from-butter to-[#FFFDF6]">
            <Blob className="-top-8 -right-16 size-44 bg-sun" />
            <Blob className="-bottom-10 -left-16 size-36 bg-papaya opacity-35" />

            <header className="fixed top-0 right-0 left-0 z-40 border-b border-leaf/10 bg-white/80 shadow-[0_2px_0_rgba(42,51,31,0.03)] backdrop-blur-md dark:bg-card/85">
                <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-3 px-4 md:px-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href={home()}
                            className="flex items-center gap-2 font-heading text-lg font-bold text-deep"
                        >
                            <span className="flex size-8 items-center justify-center rounded-xl bg-leaf text-sm text-white shadow-[0_2px_0_rgba(42,51,31,0.18)]">
                                🌿
                            </span>
                            <span className="hidden sm:inline">
                                SLC <span className="text-leaf">Scoring</span>
                            </span>
                        </Link>
                        <div className="mx-1 hidden h-6 w-px bg-leaf/20 sm:block" />
                        <span className="hidden text-xs font-bold tracking-widest text-ink/70 uppercase sm:block">
                            Leaderboard Publik
                        </span>
                    </div>
                    <div className="flex items-center gap-5">
                        <span className="hidden text-xs font-bold tracking-wider text-leaf uppercase md:block">
                            {eventName}
                        </span>
                        {live && (
                            <div className="hidden items-center gap-2 border-l border-leaf/20 pl-5 text-ink/60 lg:flex">
                                <span className="inline-block size-2 animate-pulse rounded-full bg-papaya" />
                                <span className="text-xs font-bold tracking-wider">
                                    Live Update
                                </span>
                            </div>
                        )}
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex items-center gap-2 rounded-2xl border-2 border-leaf bg-leaf px-4 py-2 font-heading text-sm font-bold text-white shadow-[0_3px_0_rgba(42,51,31,0.2)] transition-all active:translate-y-0.5 active:shadow-[0_1px_0_rgba(42,51,31,0.2)] sm:px-5"
                            >
                                <LayoutGrid className="size-4" />
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={login()}
                                className="inline-flex items-center gap-2 rounded-2xl border-2 border-leaf bg-leaf px-4 py-2 font-heading text-sm font-bold text-white shadow-[0_3px_0_rgba(42,51,31,0.2)] transition-all active:translate-y-0.5 active:shadow-[0_1px_0_rgba(42,51,31,0.2)] sm:px-5"
                            >
                                <LogIn className="size-4" />
                                Masuk
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pt-24 pb-12 md:px-6">
                {children}
            </main>

            <footer className="border-t border-leaf/10 py-6">
                <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-3 px-4 md:flex-row md:px-6">
                    <span className="text-xs font-bold tracking-wider text-ink/50">
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
