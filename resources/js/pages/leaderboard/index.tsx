import { Head, Link, usePoll } from '@inertiajs/react';
import { Blob } from '@/components/slc/blob';
import PublicLayout from '@/layouts/public-layout';
import { show } from '@/routes/leaderboard';

type Entry = {
    rank: number;
    total: number;
    participant: {
        id: number;
        participant_number: string;
        name: string;
        institution: string | null;
        panel: string | null;
    };
};

function PodiumCard({ entry }: { entry: Entry }) {
    const isFirst = entry.rank === 1;
    const isSecond = entry.rank === 2;

    const medal = isFirst ? '🥇' : isSecond ? '🥈' : '🥉';
    const colors = isFirst
        ? 'bg-sun border-sun shadow-md'
        : isSecond
          ? 'bg-butter border-sun/50 shadow-sm'
          : 'bg-butter border-sun/30 shadow-sm';

    return (
        <Link
            href={show(entry.participant.id)}
            className={`relative flex flex-col items-center overflow-hidden rounded-2xl border-2 ${colors} p-8 text-center transition-transform duration-200 hover:-translate-y-1`}
        >
            <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
                {medal}
            </div>
            <span
                className="mb-2 inline-block rounded-full bg-white/80 px-3.5 py-1 font-heading text-xs font-bold text-deep shadow-sm"
                style={{ transform: 'rotate(-2deg)' }}
            >
                RANK {String(entry.rank).padStart(2, '0')}
            </span>
            <h3 className="font-heading text-xl font-bold text-deep">
                {entry.participant.name}
            </h3>
            <p className="mt-1 text-xs font-bold text-deep/70">
                {entry.participant.panel
                    ? `Panel: ${entry.participant.panel}`
                    : (entry.participant.institution ??
                      entry.participant.participant_number)}
            </p>
            <div className="mt-6 w-full border-t border-white/30 pt-6">
                <span className="font-heading text-5xl font-bold text-papaya">
                    {entry.total.toFixed(1)}
                </span>
                <span className="ml-1.5 text-xs font-bold text-deep/60">
                    pts
                </span>
            </div>
        </Link>
    );
}

export default function LeaderboardIndex({
    eventName,
    standings,
    isFinal,
}: {
    eventName: string;
    standings: Entry[];
    isFinal: boolean;
}) {
    usePoll(15000);

    const podium = standings.slice(0, 3);
    const rest = standings.slice(3);

    return (
        <PublicLayout eventName={eventName} live={!isFinal}>
            <Head title="Leaderboard" />
            <div className="relative flex flex-col gap-8">
                <Blob className="-top-8 -right-12 size-40 bg-sun" />
                <Blob className="-bottom-8 -left-12 size-36 bg-papaya opacity-25" />

                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <h1 className="font-heading text-[32px] leading-10 font-bold text-deep">
                            {isFinal
                                ? 'Klasemen Akhir'
                                : 'Leaderboard Real-time'}
                        </h1>
                        <p className="mt-2 font-semibold text-ink/70">
                            {isFinal
                                ? 'Hasil akhir seluruh ronde perlombaan.'
                                : 'Klasemen sementara — penilaian masih berlangsung.'}
                        </p>
                    </div>
                    {!isFinal && (
                        <div className="flex items-center gap-3 rounded-2xl border-2 border-leaf/10 bg-white px-4 py-2 shadow-sm">
                            <span className="inline-block size-2 animate-pulse rounded-full bg-papaya" />
                            <span className="font-heading text-xs font-bold tracking-wider text-deep/70">
                                Pembaruan langsung
                            </span>
                        </div>
                    )}
                </div>

                {standings.length === 0 && (
                    <div className="rounded-2xl border-2 border-dashed border-leaf/20 bg-white p-16 text-center font-semibold text-deep/70">
                        Belum ada nilai yang masuk.
                    </div>
                )}

                {podium.length > 0 && (
                    <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-3">
                        {podium[1] && (
                            <div className="order-2 md:order-1">
                                <PodiumCard entry={podium[1]} />
                            </div>
                        )}
                        {podium[0] && (
                            <div className="order-1 md:order-2">
                                <PodiumCard entry={podium[0]} />
                            </div>
                        )}
                        {podium[2] && (
                            <div className="order-3 md:order-3">
                                <PodiumCard entry={podium[2]} />
                            </div>
                        )}
                    </div>
                )}

                {rest.length > 0 && (
                    <div className="overflow-hidden rounded-2xl border-2 border-leaf/10 bg-white shadow-sm">
                        <table className="w-full border-collapse text-left">
                            <thead className="border-b border-leaf/10 bg-butter">
                                <tr>
                                    <th className="w-24 px-6 py-4 text-center font-heading text-xs font-bold tracking-wider text-deep/70 uppercase">
                                        Rank
                                    </th>
                                    <th className="px-6 py-4 font-heading text-xs font-bold tracking-wider text-deep/70 uppercase">
                                        Peserta
                                    </th>
                                    <th className="hidden px-6 py-4 font-heading text-xs font-bold tracking-wider text-deep/70 uppercase sm:table-cell">
                                        Panel / Institusi
                                    </th>
                                    <th className="px-6 py-4 pr-12 text-right font-heading text-xs font-bold tracking-wider text-deep/70 uppercase">
                                        Skor Akhir
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-leaf/10">
                                {rest.map((entry) => {
                                    const rankColors =
                                        entry.rank === 4
                                            ? 'bg-leaf/10 text-leaf'
                                            : entry.rank === 5
                                              ? 'bg-leaf/5 text-deep'
                                              : 'text-deep/70';

                                    return (
                                        <tr
                                            key={entry.participant.id}
                                            className="transition-colors hover:bg-butter/50"
                                        >
                                            <td
                                                className={`px-6 py-5 text-center font-heading font-bold ${rankColors}`}
                                            >
                                                #{entry.rank}
                                            </td>
                                            <td className="px-6 py-5">
                                                <Link
                                                    href={show(
                                                        entry.participant.id,
                                                    )}
                                                    className="flex items-center gap-3"
                                                >
                                                    <div className="flex size-9 items-center justify-center rounded-full bg-butter font-heading text-sm font-bold text-deep">
                                                        {entry.participant.name.charAt(
                                                            0,
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-deep hover:text-leaf">
                                                        {entry.participant.name}
                                                    </span>
                                                </Link>
                                            </td>
                                            <td className="hidden px-6 py-5 font-semibold text-deep/70 sm:table-cell">
                                                {entry.participant.panel ??
                                                    entry.participant
                                                        .institution ??
                                                    '—'}
                                            </td>
                                            <td className="px-6 py-5 pr-12 text-right">
                                                <span className="font-heading text-lg font-bold text-papaya">
                                                    {entry.total.toFixed(1)}
                                                </span>
                                                <span className="ml-1 text-xs font-bold text-deep/60">
                                                    pts
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
