import { Head } from '@inertiajs/react';
import { Blob } from '@/components/slc/blob';
import PublicLayout from '@/layouts/public-layout';

export default function LeaderboardUnpublished({
    eventName,
}: {
    eventName: string;
}) {
    return (
        <PublicLayout eventName={eventName}>
            <Head title="Leaderboard" />
            <div className="relative flex flex-col items-center justify-center gap-4 py-24 text-center">
                <Blob className="-top-8 -right-8 size-40 bg-sun" />
                <Blob className="-bottom-8 -left-8 size-36 bg-papaya opacity-25" />
                <span className="flex size-16 items-center justify-center rounded-2xl bg-butter text-2xl shadow-sm">
                    🔒
                </span>
                <h1 className="font-heading text-2xl font-bold text-deep">
                    Hasil Belum Dipublikasikan
                </h1>
                <p className="max-w-md font-semibold text-ink/70">
                    Klasemen {eventName} akan tersedia di halaman ini setelah
                    panitia mempublikasikan hasil perlombaan.
                </p>
            </div>
        </PublicLayout>
    );
}
