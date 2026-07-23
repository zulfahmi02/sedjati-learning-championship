import { Head, router } from '@inertiajs/react';
import { Plus, Sparkles, Trophy } from 'lucide-react';
import { Blob } from '@/components/slc/blob';
import { ParticipantAvatar } from '@/components/slc/participant-avatar';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes/judge';
import liveScoring from '@/routes/judge/live-scoring';

type QueueItem = {
    id: number;
    participant_number: string;
    name: string;
    current_score: number;
};

type Props = {
    panel: { id: number; name: string } | null;
    activeRound: {
        id: number;
        name: string;
        sequence: number;
    } | null;
    maxScore: number | null;
    participants: QueueItem[];
};

export default function LiveScoring({
    panel,
    activeRound,
    maxScore,
    participants,
}: Props) {
    const handleAddScore = (participantId: number) => {
        router.post(
            liveScoring.increment.url({ participant: participantId }),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head title="Live Scoring Juri" />
            <div className="relative flex h-full flex-1 flex-col gap-6 overflow-hidden p-4 md:p-6">
                <Blob className="-top-16 -right-16 size-44 bg-sun opacity-25" />
                <Blob className="-bottom-12 -left-14 size-36 bg-papaya opacity-20" />

                <div className="relative flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <div
                            className="mb-2 inline-flex items-center gap-2 rounded-full bg-papaya px-4 py-1.5 font-heading text-xs font-bold text-white shadow-[0_2px_0_rgba(42,51,31,0.14)]"
                            style={{ transform: 'rotate(-2deg)' }}
                        >
                            <Sparkles className="size-3.5" />
                            Panel Juri
                        </div>
                        <h1 className="slc-page-title">
                            Live Scoring Cerdas Cermat
                        </h1>
                        <p className="slc-page-description">
                            {panel
                                ? `Panel Anda: ${panel.name}`
                                : 'Anda belum ditugaskan ke panel mana pun.'}
                            {activeRound &&
                                ` · Ronde: ${activeRound.name} (+1 poin/klik)`}
                        </p>
                    </div>
                    {activeRound && (
                        <div className="flex items-center gap-3 rounded-2xl border-2 border-leaf/10 bg-white px-4 py-2 shadow-[0_3px_0_rgba(42,51,31,0.06)] dark:bg-card">
                            <span className="flex size-9 items-center justify-center rounded-xl bg-sun text-deep">
                                <Trophy className="size-4" />
                            </span>
                            <div>
                                <p className="font-heading text-sm font-bold text-deep">
                                    {activeRound.name}
                                </p>
                                <p className="text-xs font-bold text-papaya">
                                    +1 poin per klik
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {!panel && (
                    <div className="slc-empty-state relative">
                        <div className="mb-3 text-4xl">🌿</div>
                        Hubungi administrator untuk penugasan panel Anda.
                    </div>
                )}

                {panel && !activeRound && (
                    <div className="slc-empty-state relative">
                        <div className="mb-3 text-4xl">⏳</div>
                        Belum ada ronde yang berlangsung.
                    </div>
                )}

                {panel && activeRound && (
                    <div className="relative grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {participants.map((participant) => (
                            <div
                                key={participant.id}
                                className="group relative flex min-h-72 flex-col items-center overflow-hidden rounded-3xl border-2 border-leaf/10 bg-white p-6 text-center shadow-[0_4px_0_rgba(42,51,31,0.07)] transition-all duration-200 hover:-translate-y-1 hover:border-leaf/25 dark:bg-card"
                            >
                                <span
                                    aria-hidden
                                    className="absolute -top-10 -right-10 size-28 rounded-full bg-sun/25 transition-transform duration-300 group-hover:scale-110"
                                />
                                <ParticipantAvatar
                                    name={participant.name}
                                    className="relative mb-4 size-20 border-4 border-butter bg-butter text-xl shadow-sm"
                                />
                                <h3 className="mb-1 line-clamp-2 font-heading text-lg leading-tight font-bold text-deep">
                                    {participant.name}
                                </h3>
                                <p className="mb-4 text-xs font-bold tracking-wider text-ink/55">
                                    NO. {participant.participant_number}
                                </p>

                                <div className="mt-auto w-full border-t border-leaf/10 pt-4">
                                    <div className="mb-4">
                                        <span className="font-heading text-4xl font-bold text-papaya">
                                            {Number(
                                                participant.current_score,
                                            ).toFixed(1)}
                                        </span>
                                        <span className="ml-1 text-xs font-bold text-ink/55">
                                            poin
                                        </span>
                                    </div>
                                    <Button
                                        size="lg"
                                        className="h-14 w-full rounded-[1.4rem] text-lg"
                                        disabled={
                                            maxScore !== null &&
                                            participant.current_score >=
                                                maxScore
                                        }
                                        onClick={() =>
                                            handleAddScore(participant.id)
                                        }
                                    >
                                        <Plus className="size-6" />+1
                                        Poin
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

LiveScoring.layout = () => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Live Scoring',
            href: liveScoring.index.url(),
        },
    ],
});
