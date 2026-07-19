import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, LogIn, RefreshCw } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { Button } from '@/components/ui/button';
import { dashboard, home, login } from '@/routes';

export default function PublicLayout({
    children,
    eventName = 'SLC Scoring',
    live = false,
}: PropsWithChildren<{ eventName?: string; live?: boolean }>) {
    const { auth } = usePage().props;

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="fixed top-0 right-0 left-0 z-40 border-b bg-background/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-4 px-4 md:px-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href={home()}
                            className="font-heading text-lg font-semibold text-foreground"
                        >
                            SLC <span className="text-primary">Scoring</span>
                        </Link>
                        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
                        <span className="hidden text-xs font-semibold tracking-widest text-muted-foreground uppercase sm:block">
                            Leaderboard Publik
                        </span>
                    </div>
                    <div className="flex items-center gap-5">
                        <span className="hidden text-xs font-bold tracking-wider text-primary uppercase md:block">
                            {eventName}
                        </span>
                        {live && (
                            <div className="hidden items-center gap-2 border-l pl-5 text-muted-foreground lg:flex">
                                <RefreshCw className="size-4" />
                                <span className="text-xs font-semibold tracking-wider">
                                    Live Update
                                </span>
                            </div>
                        )}
                        {auth.user ? (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={dashboard()}>
                                    <LayoutGrid className="size-4" />
                                    Dashboard
                                </Link>
                            </Button>
                        ) : (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={login()}>
                                    <LogIn className="size-4" />
                                    Masuk
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </header>
            <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pt-24 pb-12 md:px-6">
                {children}
            </main>
            <footer className="border-t py-6">
                <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-3 px-4 md:flex-row md:px-6">
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground">
                        © {new Date().getFullYear()} Sedjati Learning
                        Championship
                    </span>
                    <div className="flex gap-2">
                        <span className="size-3 rounded-full bg-border" />
                        <span className="size-3 rounded-full bg-border" />
                        <span className="size-3 rounded-full bg-primary" />
                    </div>
                </div>
            </footer>
        </div>
    );
}
