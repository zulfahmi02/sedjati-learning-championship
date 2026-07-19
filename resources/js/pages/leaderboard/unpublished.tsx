import { Head } from '@inertiajs/react';
import { EyeOff } from 'lucide-react';
import PublicLayout from '@/layouts/public-layout';

export default function LeaderboardUnpublished({
    eventName,
}: {
    eventName: string;
}) {
    return (
        <PublicLayout eventName={eventName}>
            <Head title="Leaderboard" />
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
                <span className="flex size-16 items-center justify-center rounded-full bg-muted">
                    <EyeOff className="size-7 text-muted-foreground" />
                </span>
                <h1 className="font-heading text-2xl font-semibold">
                    Hasil Belum Dipublikasikan
                </h1>
                <p className="max-w-md text-muted-foreground">
                    Klasemen {eventName} akan tersedia di halaman ini setelah
                    panitia mempublikasikan hasil perlombaan.
                </p>
            </div>
        </PublicLayout>
    );
}
