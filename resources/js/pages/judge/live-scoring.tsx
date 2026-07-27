import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Minus,
    Plus,
    Save,
    Send,
    Sparkles,
    Trophy,
} from 'lucide-react';
import { useMemo, useState } from 'react';
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
import { Input } from '@/components/ui/input';
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

type ScoreValues = Record<number, string>;
type ProcessingAction = 'adjust' | 'save' | 'submit' | null;

const valuesFromParticipants = (participants: QueueItem[]): ScoreValues =>
    Object.fromEntries(
        participants.map((participant) => [
            participant.id,
            String(participant.current_score),
        ]),
    );

export default function LiveScoring({
    panel,
    activeRound,
    criterion,
    participants,
}: Props) {
    const [scoreValues, setScoreValues] = useState<ScoreValues>(() =>
        valuesFromParticipants(participants),
    );
    const [processingAction, setProcessingAction] =
        useState<ProcessingAction>(null);
    const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
    const [batchError, setBatchError] = useState<string | null>(null);

    const editableParticipants = useMemo(
        () =>
            participants.filter(
                (participant) => participant.status !== 'submitted',
            ),
        [participants],
    );

    const isValidScore = (participant: QueueItem): boolean => {
        const value = Number(scoreValues[participant.id]);

        return (
            scoreValues[participant.id] !== '' &&
            Number.isFinite(value) &&
            value >= criterion.min_score &&
            value <= criterion.max_score
        );
    };

    const dirtyParticipants = editableParticipants.filter(
        (participant) =>
            isValidScore(participant) &&
            Number(scoreValues[participant.id]) !== participant.current_score,
    );
    const invalidParticipants = editableParticipants.filter(
        (participant) => !isValidScore(participant),
    );
    const isProcessing = processingAction !== null;

    const setScore = (participantId: number, value: string) => {
        setBatchError(null);
        setScoreValues((current) => ({
            ...current,
            [participantId]: value,
        }));
    };

    const adjustScore = (participant: QueueItem, delta: -1 | 1) => {
        if (participant.status === 'submitted' || isProcessing) {
            return;
        }

        const previousValue = scoreValues[participant.id] ?? '';
        const currentValue = Number(scoreValues[participant.id]);
        const safeCurrentValue = Number.isFinite(currentValue)
            ? currentValue
            : participant.current_score;
        const nextValue = Math.min(
            criterion.max_score,
            Math.max(criterion.min_score, safeCurrentValue + delta),
        );

        if (nextValue === safeCurrentValue) {
            return;
        }

        setScore(participant.id, String(nextValue));
        setProcessingAction('adjust');

        router.patch(
            liveScoring.adjust(participant.id).url,
            { delta },
            {
                preserveScroll: true,
                preserveState: true,
                onError: (errors) => {
                    setScoreValues((current) => ({
                        ...current,
                        [participant.id]: previousValue,
                    }));
                    handleErrors(errors);
                },
                onFinish: () => setProcessingAction(null),
            },
        );
    };

    const entriesFor = (items: QueueItem[]) =>
        items.map((participant) => ({
            participant_id: participant.id,
            value: Number(scoreValues[participant.id]),
        }));

    const handleErrors = (errors: Record<string, string>) => {
        setBatchError(
            Object.values(errors)[0] ??
                'Nilai gagal diproses. Periksa kembali seluruh input.',
        );
    };

    const saveAll = () => {
        if (
            dirtyParticipants.length === 0 ||
            invalidParticipants.length > 0 ||
            isProcessing
        ) {
            return;
        }

        setBatchError(null);
        setProcessingAction('save');
        router.patch(
            liveScoring.batchUpdate().url,
            { scores: entriesFor(dirtyParticipants) },
            {
                preserveScroll: true,
                onError: handleErrors,
                onFinish: () => setProcessingAction(null),
            },
        );
    };

    const submitAll = () => {
        if (
            editableParticipants.length === 0 ||
            invalidParticipants.length > 0 ||
            isProcessing
        ) {
            return;
        }

        setBatchError(null);
        setProcessingAction('submit');
        router.post(
            liveScoring.batchSubmit().url,
            { scores: entriesFor(editableParticipants) },
            {
                preserveScroll: true,
                onError: handleErrors,
                onSuccess: () => setShowSubmitConfirmation(false),
                onFinish: () => setProcessingAction(null),
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
                            {activeRound.name} · {criterion.name} · masukkan
                            nilai lalu simpan bersama
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
                                Rentang {criterion.min_score}–
                                {criterion.max_score} poin
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-leaf/10 bg-white/80 p-3 shadow-sm backdrop-blur-sm dark:bg-card/85">
                    <div className="flex items-center gap-3 text-sm font-bold text-deep/70">
                        <span>{editableParticipants.length} belum dikirim</span>
                        {dirtyParticipants.length > 0 && (
                            <span className="rounded-full bg-sun/25 px-3 py-1 text-deep">
                                {dirtyParticipants.length} perubahan
                            </span>
                        )}
                        {processingAction === 'adjust' && (
                            <span className="rounded-full bg-leaf/10 px-3 py-1 text-leaf">
                                Menyimpan perubahan...
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            disabled={
                                dirtyParticipants.length === 0 ||
                                invalidParticipants.length > 0 ||
                                isProcessing
                            }
                            onClick={saveAll}
                        >
                            <Save className="size-4" />
                            {processingAction === 'save'
                                ? 'Menyimpan...'
                                : 'Simpan Semua'}
                        </Button>
                        <Button
                            disabled={
                                editableParticipants.length === 0 ||
                                invalidParticipants.length > 0 ||
                                isProcessing
                            }
                            onClick={() => setShowSubmitConfirmation(true)}
                        >
                            <Send className="size-4" />
                            {editableParticipants.length === 0
                                ? 'Semua Terkirim'
                                : 'Kirim Semua'}
                        </Button>
                    </div>
                </div>

                {(batchError || invalidParticipants.length > 0) && (
                    <div className="relative flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
                        <AlertCircle className="size-4 shrink-0" />
                        {batchError ??
                            `Nilai harus berada di antara ${criterion.min_score} dan ${criterion.max_score}.`}
                    </div>
                )}

                <div className="relative grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {participants.map((participant) => {
                        const isSubmitted = participant.status === 'submitted';
                        const isDirty = dirtyParticipants.some(
                            (item) => item.id === participant.id,
                        );
                        const isInvalid = invalidParticipants.some(
                            (item) => item.id === participant.id,
                        );
                        const numericValue = Number(
                            scoreValues[participant.id],
                        );

                        return (
                            <div
                                key={participant.id}
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
                                <div className="flex min-h-7 items-center gap-2">
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
                                    {isDirty && (
                                        <span className="rounded-full bg-sun/25 px-2.5 py-1 text-[0.65rem] font-bold text-deep">
                                            Belum disimpan
                                        </span>
                                    )}
                                </div>

                                <div className="mt-auto w-full border-t border-leaf/10 pt-4">
                                    {isSubmitted ? (
                                        <>
                                            <div className="mb-4">
                                                <span className="font-heading text-5xl font-bold text-papaya">
                                                    {participant.current_score}
                                                </span>
                                                <span className="ml-1 text-xs font-bold text-ink/55">
                                                    poin
                                                </span>
                                            </div>
                                            <div className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-leaf/10 font-bold text-leaf">
                                                <CheckCircle2 className="size-4" />
                                                Nilai terkirim
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-3">
                                            <div>
                                                <Input
                                                    type="number"
                                                    inputMode="decimal"
                                                    min={criterion.min_score}
                                                    max={criterion.max_score}
                                                    step="1"
                                                    value={
                                                        scoreValues[
                                                            participant.id
                                                        ] ?? ''
                                                    }
                                                    aria-label={`Nilai ${participant.name}`}
                                                    aria-invalid={isInvalid}
                                                    disabled={isProcessing}
                                                    className="h-16 rounded-2xl text-center font-heading text-3xl font-bold text-papaya numeric md:text-3xl"
                                                    onChange={(event) =>
                                                        setScore(
                                                            participant.id,
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                <p className="mt-1 text-xs font-semibold text-ink/55">
                                                    {Number.isFinite(
                                                        numericValue,
                                                    )
                                                        ? `${numericValue} poin`
                                                        : 'Masukkan nilai'}
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="lg"
                                                    disabled={
                                                        isProcessing ||
                                                        (Number.isFinite(
                                                            numericValue,
                                                        ) &&
                                                            numericValue <=
                                                                criterion.min_score)
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
                                                        (Number.isFinite(
                                                            numericValue,
                                                        ) &&
                                                            numericValue >=
                                                                criterion.max_score)
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
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <Dialog
                open={showSubmitConfirmation}
                onOpenChange={(open) =>
                    !isProcessing && setShowSubmitConfirmation(open)
                }
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Kirim semua nilai final?</DialogTitle>
                        <DialogDescription>
                            Sebanyak{' '}
                            <strong>{editableParticipants.length} nilai</strong>{' '}
                            akan disimpan dan dikirim sekaligus. Setelah
                            dikirim, nilai hanya dapat dikoreksi jika
                            administrator membukanya kembali.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            disabled={isProcessing}
                            onClick={() => setShowSubmitConfirmation(false)}
                        >
                            Batal
                        </Button>
                        <Button disabled={isProcessing} onClick={submitAll}>
                            <Send className="size-4" />
                            {processingAction === 'submit'
                                ? 'Mengirim...'
                                : 'Ya, Kirim Semua'}
                        </Button>
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
