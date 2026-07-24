import { Head } from '@inertiajs/react';
import { LockKeyhole } from 'lucide-react';
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
            <div className="relative mx-auto flex min-h-[calc(100svh-13rem)] max-w-3xl items-center justify-center py-8 text-center">
                <Blob className="-top-4 -right-10 size-40 bg-sun" />
                <Blob className="-bottom-4 -left-10 size-36 bg-papaya opacity-25" />

                <section className="relative z-10 w-full overflow-hidden rounded-[2rem] border-2 border-leaf/15 bg-white/90 px-6 py-12 shadow-[0_8px_0_rgba(42,51,31,0.08)] backdrop-blur-sm sm:px-12 sm:py-16">
                    <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-leaf via-sun to-papaya" />
                    <div className="mx-auto flex max-w-xl flex-col items-center gap-5">
                        <span className="inline-flex rounded-full border border-leaf/15 bg-leaf/10 px-4 py-1.5 text-xs font-extrabold tracking-[0.16em] text-deep uppercase">
                            Leaderboard Publik
                        </span>
                        <span className="flex size-20 items-center justify-center rounded-3xl bg-deep text-sun shadow-[0_5px_0_rgba(42,51,31,0.2)]">
                            <LockKeyhole className="size-8" strokeWidth={2.5} />
                        </span>
                        <div className="flex flex-col gap-3">
                            <h1 className="font-heading text-3xl leading-tight font-extrabold text-deep sm:text-4xl">
                                Hasil Belum Dipublikasikan
                            </h1>
                            <p className="text-base leading-7 font-semibold text-deep/80 sm:text-lg">
                                Klasemen {eventName} akan tersedia di halaman
                                ini setelah panitia mempublikasikan hasil
                                perlombaan.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}
