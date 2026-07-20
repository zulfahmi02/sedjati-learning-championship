import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Blob } from '@/components/slc/blob';
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
            <div className="relative mx-auto flex max-w-3xl flex-col gap-6">
                <Blob className="-top-6 -right-8 size-32 bg-sun" />
                <Blob className="-bottom-6 -left-8 size-28 bg-papaya opacity-25" />

                <Link
                    href={index()}
                    className="flex w-fit items-center gap-1.5 text-sm font-bold text-leaf hover:text-leaf/80"
                >
                    <ArrowLeft className="size-4" />
                    Kembali ke leaderboard
                </Link>

                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-leaf/10 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex size-16 items-center justify-center rounded-2xl bg-butter text-2xl shadow-sm">
                            🌟
                        </div>
                        <div>
                            <h1 className="font-heading text-2xl font-bold text-deep">
                                {participant.name}
                            </h1>
                            <p className="text-sm font-semibold text-deep/70">
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
                            <p className="text-xs font-bold tracking-wider text-deep/70 uppercase">
                                Peringkat {rank}
                            </p>
                        )}
                        <p className="font-heading text-4xl font-bold text-papaya">
                            {total.toFixed(2)}
                        </p>
                        <p className="text-xs font-semibold text-deep/70">
                            Skor akhir berbobot
                        </p>
                    </div>
                </div>

                {breakdown.map((entry, i) => {
                    const roundColors = [
                        'border-leaf/20',
                        'border-sun/20',
                        'border-papaya/20',
                    ];
                    const headerColors = [
                        'bg-leaf/10',
                        'bg-sun/10',
                        'bg-papaya/10',
                    ];
                    const ci = i % 3;
                    return (
                        <div
                            key={entry.round.id}
                            className={`rounded-2xl border-2 ${roundColors[ci]} bg-white shadow-sm`}
                        >
                            <div
                                className={`flex items-center justify-between border-b ${headerColors[ci]} px-5 py-4`}
                            >
                                <div className="flex items-center gap-3">
                                    <h2 className="font-heading text-lg font-bold text-deep">
                                        {entry.round.name}
                                    </h2>
                                    <span
                                        className="inline-block rounded-full px-3 py-1 font-heading text-xs font-bold shadow-sm"
                                        style={{
                                            background:
                                                entry.round.status === 'active'
                                                    ? '#4F9A46'
                                                    : entry.round.status ===
                                                        'locked'
                                                      ? '#FF8C42'
                                                      : '#FFF3D6',
                                            color:
                                                entry.round.status ===
                                                    'pending'
                                                    ? '#2A331F'
                                                    : '#ffffff',
                                            transform: 'rotate(1deg)',
                                        }}
                                    >
                                        {entry.round.status === 'active'
                                            ? 'Berlangsung'
                                            : entry.round.status === 'locked'
                                              ? 'Terkunci'
                                              : 'Menunggu'}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="font-heading text-xl font-bold text-deep">
                                        {entry.score !== null
                                            ? entry.score.toFixed(2)
                                            : '—'}
                                    </span>
                                    <span className="ml-2 text-xs font-semibold text-deep/70">
                                        bobot {entry.round.weight}%
                                    </span>
                                </div>
                            </div>
                            {entry.score === null ? (
                                <p className="px-5 py-6 text-center text-sm font-semibold text-deep/70">
                                    Belum ada nilai final untuk ronde ini.
                                </p>
                            ) : (
                                <ul className="divide-y divide-leaf/10">
                                    {entry.criteria.map((criterion) => (
                                        <li
                                            key={criterion.name}
                                            className="flex items-center justify-between px-5 py-3"
                                        >
                                            <div>
                                                <p className="text-sm font-bold text-deep">
                                                    {criterion.name}
                                                </p>
                                                <p className="text-xs font-semibold text-deep/70">
                                                    Bobot {criterion.weight}%
                                                </p>
                                            </div>
                                            <span className="font-heading font-bold text-leaf">
                                                {criterion.value !== null
                                                    ? `${criterion.value}/${criterion.max_score}`
                                                    : '—'}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    );
                })}
            </div>
        </PublicLayout>
    );
}
