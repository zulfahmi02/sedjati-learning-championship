import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { ParticipantAvatar } from '@/components/slc/participant-avatar';
import { StatusBadge } from '@/components/slc/status-badge';
import PublicLayout from '@/layouts/public-layout';
import { index } from '@/routes/leaderboard';
import type { RoundStatus } from '@/types';

type BreakdownEntry = {
    round: {
        id: number;
        name: string;
        sequence: number;
        weight: number;
        status: RoundStatus;
    };
    score: number | null;
    criteria: {
        name: string;
        weight: number;
        max_score: number;
        value: number | null;
    }[];
};

type Props = {
    eventName: string;
    participant: {
        id: number;
        participant_number: string;
        name: string;
        institution: string | null;
        panel: string | null;
    };
    rank: number | null;
    total: number;
    breakdown: BreakdownEntry[];
};

export default function LeaderboardShow({
    eventName,
    participant,
    rank,
    total,
    breakdown,
}: Props) {
    return (
        <PublicLayout eventName={eventName}>
            <Head title={`${participant.name} — Rincian Nilai`} />
            <div className="mx-auto flex max-w-3xl flex-col gap-6">
                <Link
                    href={index()}
                    className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Kembali ke leaderboard
                </Link>

                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-6">
                    <div className="flex items-center gap-4">
                        <ParticipantAvatar
                            name={participant.name}
                            className="size-16"
                        />
                        <div>
                            <h1 className="font-heading text-2xl font-semibold">
                                {participant.name}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {[
                                    participant.participant_number,
                                    participant.institution,
                                    participant.panel &&
                                        `Panel: ${participant.panel}`,
                                ]
                                    .filter(Boolean)
                                    .join(' · ')}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        {rank !== null && (
                            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Peringkat {rank}
                            </p>
                        )}
                        <p className="numeric font-heading text-4xl font-bold text-primary">
                            {total.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Skor akhir berbobot
                        </p>
                    </div>
                </div>

                {breakdown.map((entry) => (
                    <div
                        key={entry.round.id}
                        className="rounded-xl border bg-card"
                    >
                        <div className="flex items-center justify-between border-b px-5 py-4">
                            <div className="flex items-center gap-3">
                                <h2 className="font-heading text-lg font-semibold">
                                    {entry.round.name}
                                </h2>
                                <StatusBadge status={entry.round.status} />
                            </div>
                            <div className="text-right">
                                <span className="numeric font-heading text-xl font-bold">
                                    {entry.score !== null
                                        ? entry.score.toFixed(2)
                                        : '—'}
                                </span>
                                <span className="ml-2 text-xs text-muted-foreground">
                                    bobot {entry.round.weight}%
                                </span>
                            </div>
                        </div>
                        {entry.score === null ? (
                            <p className="px-5 py-6 text-center text-sm text-muted-foreground">
                                Belum ada nilai final untuk ronde ini.
                            </p>
                        ) : (
                            <ul className="divide-y">
                                {entry.criteria.map((criterion) => (
                                    <li
                                        key={criterion.name}
                                        className="flex items-center justify-between px-5 py-3"
                                    >
                                        <div>
                                            <p className="text-sm font-medium">
                                                {criterion.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Bobot {criterion.weight}%
                                            </p>
                                        </div>
                                        <span className="numeric font-heading font-semibold">
                                            {criterion.value !== null
                                                ? `${criterion.value}/${criterion.max_score}`
                                                : '—'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        </PublicLayout>
    );
}
