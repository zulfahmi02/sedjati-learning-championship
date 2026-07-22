import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { ParticipantAvatar } from '@/components/slc/participant-avatar';
import { Button } from '@/components/ui/button';
import liveScoring from '@/routes/judge/live-scoring';
import { dashboard } from '@/routes/judge';

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
    participants: QueueItem[];
};

export default function LiveScoring({
    panel,
    activeRound,
    participants,
}: Props) {
    const handleAddScore = (participantId: number) => {
        router.post(liveScoring.increment.url({ participant: participantId }), {}, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Live Scoring Juri" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="font-heading text-2xl font-semibold">
                            Uji Coba: Live Scoring (Cerdas Cermat)
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {panel
                                ? `Panel Anda: ${panel.name}`
                                : 'Anda belum ditugaskan ke panel mana pun.'}
                            {activeRound &&
                                ` · Ronde: ${activeRound.name} (+${activeRound.sequence} poin/klik)`}
                        </p>
                    </div>
                </div>

                {!panel && (
                    <div className="rounded-lg border border-dashed bg-card p-10 text-center text-muted-foreground">
                        Hubungi administrator untuk penugasan panel Anda.
                    </div>
                )}

                {panel && !activeRound && (
                    <div className="rounded-lg border border-dashed bg-card p-10 text-center text-muted-foreground">
                        Belum ada ronde yang berlangsung.
                    </div>
                )}

                {panel && activeRound && (
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                        {participants.map((participant) => (
                            <div
                                key={participant.id}
                                className="relative flex flex-col items-center overflow-hidden rounded-xl border bg-card p-6 text-center shadow-sm transition-transform duration-200 hover:-translate-y-1"
                            >
                                <ParticipantAvatar
                                    name={participant.name}
                                    className="mb-4 size-20 border-2 border-primary/30"
                                />
                                <h3 className="font-heading font-semibold text-foreground text-lg mb-1 leading-tight line-clamp-2">
                                    {participant.name}
                                </h3>
                                <p className="text-xs font-semibold tracking-wider text-muted-foreground mb-4">
                                    NO. {participant.participant_number}
                                </p>

                                <div className="mt-auto w-full pt-4 border-t">
                                    <div className="mb-4">
                                        <span className="text-3xl font-bold text-primary">
                                            {Number(participant.current_score).toFixed(1)}
                                        </span>
                                        <span className="ml-1 text-xs font-semibold text-muted-foreground">
                                            pts
                                        </span>
                                    </div>
                                    <Button
                                        size="lg"
                                        className="w-full h-14 text-lg font-bold shadow-md active:scale-95 transition-transform"
                                        onClick={() => handleAddScore(participant.id)}
                                    >
                                        <Plus className="mr-2 size-6" />
                                        {activeRound.sequence} Poin
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
            title: 'Dashboard Lama',
            href: dashboard(),
        },
        {
            title: 'Live Scoring',
            href: liveScoring.index.url(),
        }
    ],
});
