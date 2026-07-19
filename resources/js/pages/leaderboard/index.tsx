import { Head, Link, usePoll } from '@inertiajs/react';
import { Award, Medal, Star } from 'lucide-react';
import { ParticipantAvatar } from '@/components/slc/participant-avatar';
import PublicLayout from '@/layouts/public-layout';
import { cn } from '@/lib/utils';
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

    return (
        <Link
            href={show(entry.participant.id)}
            className={cn(
                'relative flex flex-col items-center overflow-hidden rounded-xl border bg-card text-center shadow-sm transition-transform duration-200 hover:-translate-y-1',
                isFirst ? 'border-2 border-gold p-10' : 'p-8',
            )}
        >
            {isFirst && (
                <Medal
                    className="absolute -top-2 -right-2 size-32 text-gold opacity-10"
                    strokeWidth={1.5}
                />
            )}
            <ParticipantAvatar
                name={entry.participant.name}
                className={cn(
                    'mb-4',
                    isFirst
                        ? 'size-24 border-4 border-gold shadow-md'
                        : 'size-16 border-2 border-gold/30',
                )}
            />
            <span
                className={cn(
                    'mb-3 inline-flex items-center gap-1.5 rounded-full text-xs font-semibold tracking-wider',
                    isFirst
                        ? 'bg-gold px-4 py-1.5 text-gold-foreground shadow-sm'
                        : 'bg-gold/10 px-3 py-1 text-gold',
                )}
            >
                {isFirst ? (
                    <Star className="size-4 fill-current" />
                ) : (
                    <Award className="size-4" />
                )}
                RANK {String(entry.rank).padStart(2, '0')}
            </span>
            <h3
                className={cn(
                    'font-heading font-semibold text-foreground',
                    isFirst ? 'text-3xl' : 'text-xl',
                )}
            >
                {entry.participant.name}
            </h3>
            <p className="mt-1 text-xs font-semibold tracking-wider text-muted-foreground">
                {entry.participant.panel
                    ? `Panel: ${entry.participant.panel}`
                    : (entry.participant.institution ??
                      entry.participant.participant_number)}
            </p>
            <div
                className={cn(
                    'mt-6',
                    isFirst && 'w-full border-t pt-6',
                )}
            >
                <span
                    className={cn(
                        'numeric font-heading font-bold tracking-tight',
                        isFirst
                            ? 'text-5xl text-gold'
                            : 'text-[40px] text-foreground',
                    )}
                >
                    {entry.total.toFixed(1)}
                </span>
                <span className="ml-1.5 text-xs font-semibold text-muted-foreground">
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
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <h1 className="font-heading text-[32px] leading-10 font-semibold tracking-tight text-foreground">
                            {isFinal
                                ? 'Klasemen Akhir'
                                : 'Leaderboard Real-time'}
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            {isFinal
                                ? 'Hasil akhir seluruh ronde perlombaan.'
                                : 'Klasemen sementara — penilaian masih berlangsung.'}
                        </p>
                    </div>
                    {!isFinal && (
                        <div className="flex items-center gap-3 rounded-lg border bg-muted px-4 py-2">
                            <span className="size-2 animate-pulse rounded-full bg-primary" />
                            <span className="text-xs font-semibold tracking-wider text-muted-foreground">
                                Pembaruan langsung
                            </span>
                        </div>
                    )}
                </div>

                {standings.length === 0 && (
                    <div className="rounded-xl border border-dashed bg-card p-16 text-center text-muted-foreground">
                        Belum ada nilai yang masuk.
                    </div>
                )}

                {/* Podium: 2 - 1 - 3, champion raised */}
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

                {/* Table for rank 4+ */}
                {rest.length > 0 && (
                    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                        <table className="w-full border-collapse text-left">
                            <thead className="border-b bg-muted/60">
                                <tr>
                                    <th className="w-24 px-6 py-4 text-center text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Rank
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Peserta
                                    </th>
                                    <th className="hidden px-6 py-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase sm:table-cell">
                                        Panel / Institusi
                                    </th>
                                    <th className="px-6 py-4 pr-12 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Skor Akhir
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {rest.map((entry) => (
                                    <tr
                                        key={entry.participant.id}
                                        className="transition-colors hover:bg-muted/50"
                                    >
                                        <td className="numeric px-6 py-5 text-center font-medium text-muted-foreground">
                                            #{entry.rank}
                                        </td>
                                        <td className="px-6 py-5">
                                            <Link
                                                href={show(
                                                    entry.participant.id,
                                                )}
                                                className="flex items-center gap-3"
                                            >
                                                <ParticipantAvatar
                                                    name={
                                                        entry.participant.name
                                                    }
                                                    className="size-8"
                                                />
                                                <span className="font-semibold text-foreground hover:text-primary">
                                                    {entry.participant.name}
                                                </span>
                                            </Link>
                                        </td>
                                        <td className="hidden px-6 py-5 text-muted-foreground sm:table-cell">
                                            {entry.participant.panel ??
                                                entry.participant
                                                    .institution ??
                                                '—'}
                                        </td>
                                        <td className="px-6 py-5 pr-12 text-right">
                                            <span className="numeric text-lg font-bold text-foreground">
                                                {entry.total.toFixed(1)}
                                            </span>
                                            <span className="ml-1 text-xs font-semibold text-muted-foreground">
                                                pts
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
