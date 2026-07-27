import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Home } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { home } from '@/routes';

const messages: Record<number, { title: string; description: string }> = {
    403: {
        title: 'Akses ditolak',
        description: 'Anda tidak memiliki izin untuk membuka halaman ini.',
    },
    404: {
        title: 'Halaman tidak ditemukan',
        description:
            'Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.',
    },
    500: {
        title: 'Terjadi gangguan',
        description:
            'Sistem mengalami kendala. Silakan coba kembali beberapa saat lagi.',
    },
    503: {
        title: 'Sedang dalam pemeliharaan',
        description:
            'Sistem sedang diperbarui dan akan segera tersedia kembali.',
    },
};

export default function ErrorPage({ status }: { status: number }) {
    const message = messages[status] ?? messages[500];

    return (
        <main className="flex min-h-svh items-center justify-center bg-gradient-to-b from-butter to-[#fffdf6] p-6 dark:from-deep dark:to-background">
            <Head title={`${status} - ${message.title}`} />
            <section className="relative w-full max-w-lg overflow-hidden rounded-3xl border-2 border-leaf/15 bg-white/90 p-8 text-center shadow-xl backdrop-blur-sm md:p-12 dark:bg-card/90">
                <AppLogoIcon className="mx-auto mb-6 size-20 shadow-md" />
                <p className="font-heading text-6xl font-extrabold text-leaf">
                    {status}
                </p>
                <h1 className="mt-3 font-heading text-2xl font-bold text-deep dark:text-foreground">
                    {message.title}
                </h1>
                <p className="mx-auto mt-3 max-w-sm font-semibold text-ink/70 dark:text-muted-foreground">
                    {message.description}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="size-4" /> Kembali
                    </Button>
                    <Button asChild>
                        <Link href={home()}>
                            <Home className="size-4" /> Beranda
                        </Link>
                    </Button>
                </div>
            </section>
        </main>
    );
}
