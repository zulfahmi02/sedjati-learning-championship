import { Head, router, usePoll } from '@inertiajs/react';
import { CheckCircle2, Minus, Plus, Sparkles, Trophy } from 'lucide-react';
import { useRef, useState } from 'react';
import { Blob } from '@/components/slc/blob';
import { ParticipantAvatar } from '@/components/slc/participant-avatar';
import { StatusBadge } from '@/components/slc/status-badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { dashboard } from '@/routes/judge';
import liveScoring from '@/routes/judge/live-scoring';

type QueueItem = {
    id: number;
    participant_number: string;
    name: string;
    current_score: number;
    status: 'pending' | 'draft' | 'submitted';
};

type Props = {
    panel: { id: number; name: string };
    activeRound: {
        id: number;
        name: string;
        sequence: number;
    };
    criterion: {
        id: number;
        name: string;
        description: string | null;
        weight: number;
        min_score: number;
        max_score: number;
    };
    participants: QueueItem[];
};

export default function LiveScoring({
    panel,
    activeRound,
    criterion,
    participants,
}: Props) {
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [submitTarget, setSubmitTarget] = useState<QueueItem | null>(null);
    const requestInFlight = useRef(false);

    usePoll(
        10000,
        { only: ['participants'] },
        { autoStart: processingId === null },
    );

    const adjustScore = (participant: QueueItem, delta: -1 | 1) => {
        if (
            requestInFlight.current ||
            participant.status === 'submitted' ||
            (delta === -1 &&
                participant.current_score <= criterion.min_score) ||
            (delta === 1 && participant.current_score >= criterion.max_score)
        ) {
            return;
        }

        requestInFlight.current = true;
        setProcessingId(participant.id);

        router.patch(
            liveScoring.adjust(participant.id).url,
            { delta },
            {
                preserveScroll: true,
                onFinish: () => {
                    requestInFlight.current = false;
                    setProcessingId(null);
                },
            },
        );
    };

    const submitScore = () => {
        if (!submitTarget || requestInFlight.current) {
            return;
        }

        requestInFlight.current = true;
        setProcessingId(submitTarget.id);

        router.post(
            liveScoring.submit(submitTarget.id).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => setSubmitTarget(null),
                onFinish: () => {
                    requestInFlight.current = false;
                    setProcessingId(null);
                },
            },
        );
    };

    return (
        <>
            <Head title="Live Scoring" />
            <div className="relative flex h-full flex-1 flex-col gap-6 overflow-hidden p-4 md:p-6">
                <Blob className="-top-16 -right-16 size-44 bg-sun opacity-25" />
                <Blob className="-bottom-12 -left-14 size-36 bg-papaya opacity-20" />

                <div className="relative flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-papaya px-4 py-1.5 font-heading text-xs font-bold text-white">
                            <Sparkles className="size-3.5" />
                            {panel.name}
                        </div>
                        <h1 className="slc-page-title">Live Scoring</h1>
                        <p className="slc-page-description">
                            {activeRound.name} · {criterion.name} · +1/-1 poin
                        </p>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border-2 border-leaf/10 bg-white px-4 py-2 shadow-sm dark:bg-card">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-sun text-deep">
                            <Trophy className="size-4" />
                        </span>
                        <div>
                            <p className="font-heading text-sm font-bold text-deep">
                                {activeRound.name}
                            </p>
                            <p className="text-xs font-bold text-papaya">
                                Nilai maksimal {criterion.max_score}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {participants.map((participant) => {
                        const isSubmitted = participant.status === 'submitted';
                        const isProcessing = processingId === participant.id;

                        return (
                            <div
                                key={participant.id}
                                aria-busy={isProcessing}
                                className="group relative flex min-h-80 flex-col items-center overflow-hidden rounded-3xl border-2 border-leaf/10 bg-white p-6 text-center shadow-[0_4px_0_rgba(42,51,31,0.07)] dark:bg-card"
                            >
                                <ParticipantAvatar
                                    name={participant.name}
                                    className="relative mb-3 size-20 border-4 border-butter bg-butter text-xl shadow-sm"
                                />
                                <h3 className="mb-1 line-clamp-2 font-heading text-lg leading-tight font-bold text-deep">
                                    {participant.name}
                                </h3>
                                <p className="mb-3 text-xs font-bold tracking-wider text-ink/55">
                                    NO. {participant.participant_number}
                                </p>
                                <StatusBadge
                                    status={
                                        participant.status === 'pending'
                                            ? 'registered'
                                            : participant.status
                                    }
                                    label={
                                        participant.status === 'pending'
                                            ? 'Belum Dimulai'
                                            : undefined
                                    }
                                />

                                <div className="mt-auto w-full border-t border-leaf/10 pt-4">
                                    <div className="mb-4">
                                        <span className="font-heading text-5xl font-bold text-papaya">
                                            {participant.current_score}
                                        </span>
                                        <span className="ml-1 text-xs font-bold text-ink/55">
                                            poin
                                        </span>
                                    </div>

                                    {isSubmitted ? (
                                        <div className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-leaf/10 font-bold text-leaf">
                                            <CheckCircle2 className="size-4" />
                                            Nilai terkirim
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="lg"
                                                    disabled={
                                                        isProcessing ||
                                                        participant.current_score <=
                                                            criterion.min_score
                                                    }
                                                    onClick={() =>
                                                        adjustScore(
                                                            participant,
                                                            -1,
                                                        )
                                                    }
                                                >
                                                    <Minus className="size-5" />
                                                    1
                                                </Button>
                                                <Button
                                                    size="lg"
                                                    disabled={
                                                        isProcessing ||
                                                        participant.current_score >=
                                                            criterion.max_score
                                                    }
                                                    onClick={() =>
                                                        adjustScore(
                                                            participant,
                                                            1,
                                                        )
                                                    }
                                                >
                                                    <Plus className="size-5" />1
                                                </Button>
                                            </div>
                                            <Button
                                                variant="secondary"
                                                className="w-full"
                                                disabled={isProcessing}
                                                onClick={() =>
                                                    setSubmitTarget(participant)
                                                }
                                            >
                                                Selesai
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <Dialog
                open={submitTarget !== null}
                onOpenChange={(open) => !open && setSubmitTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Kirim nilai final?</DialogTitle>
                        <DialogDescription>
                            Nilai {submitTarget?.name} sebesar{' '}
                            <strong>
                                {submitTarget?.current_score ?? 0} poin
                            </strong>{' '}
                            akan dikirim. Setelah itu nilai hanya dapat
                            dikoreksi jika administrator membukanya kembali.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setSubmitTarget(null)}
                        >
                            Batal
                        </Button>
                        <Button onClick={submitScore}>Kirim nilai</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
            href: liveScoring.index(),
        },
    ],
});
