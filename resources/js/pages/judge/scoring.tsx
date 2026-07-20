import { Head, Link, router, useForm } from '@inertiajs/react';
import { Check, Save, Search, Send } from 'lucide-react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { ParticipantAvatar } from '@/components/slc/participant-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes/judge';
import scoring from '@/routes/judge/scoring';
import type { Criterion, Round } from '@/types';

type QueueItem = {
    id: number;
    participant_number: string;
    name: string;
    status: 'pending' | 'draft' | 'submitted';
};

type Props = {
    panel: { id: number; name: string };
    activeRound: {
        id: number;
        name: string;
        sequence: number;
        weight: number;
    };
    rounds: Pick<Round, 'id' | 'name' | 'sequence' | 'status'>[];
    criteria: Criterion[];
    queue: QueueItem[];
    participant: {
        id: number;
        participant_number: string;
        name: string;
        institution: string | null;
        category: string | null;
    };
    sheet: {
        status: 'draft' | 'submitted';
        values: Record<number, number>;
    } | null;
};

export default function Scoring({
    activeRound,
    rounds,
    criteria,
    queue,
    participant,
    sheet,
}: Props) {
    const submitted = sheet?.status === 'submitted';
    const [search, setSearch] = useState('');
    const [confirmSubmit, setConfirmSubmit] = useState(false);

    const form = useForm<{ scores: Record<number, number | null> }>({
        scores: Object.fromEntries(
            criteria.map((criterion) => [
                criterion.id,
                sheet?.values[criterion.id] ?? null,
            ]),
        ),
    });

    const filteredQueue = useMemo(
        () =>
            queue.filter(
                (item) =>
                    item.name
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                    item.participant_number
                        .toLowerCase()
                        .includes(search.toLowerCase()),
            ),
        [queue, search],
    );

    const totalScore = useMemo(() => {
        let total = 0;

        for (const criterion of criteria) {
            const value = form.data.scores[criterion.id];

            if (value === null || value === undefined) {
                continue;
            }

            total +=
                (value / criterion.max_score) * 100 * (criterion.weight / 100);
        }

        return Math.round(total * 100) / 100;
    }, [criteria, form.data.scores]);

    const allFilled = criteria.every(
        (criterion) =>
            form.data.scores[criterion.id] !== null &&
            form.data.scores[criterion.id] !== undefined,
    );

    const saveDraft = (onSuccess?: () => void) => {
        form.put(scoring.update(participant.id).url, {
            preserveScroll: true,
            onSuccess,
        });
    };

    const submitFinal = () => {
        saveDraft(() => {
            router.post(
                scoring.submit(participant.id).url,
                {},
                { preserveScroll: true },
            );
            setConfirmSubmit(false);
        });
    };

    return (
        <>
            <Head title={`Penilaian — ${participant.name}`} />
            <div className="flex h-full flex-1">
                {/* Participant queue */}
                <aside className="hidden w-72 shrink-0 flex-col border-r bg-white md:flex">
                    <div className="border-b p-4">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-deep/70" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari peserta..."
                                className="pl-9"
                            />
                        </div>
                    </div>
                    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                        {filteredQueue.map((item) => (
                                <Link
                                    key={item.id}
                                    href={scoring.show(item.id)}
                                    className={cn(
                                        'flex items-center justify-between rounded-2xl border-2 border-leaf/10 p-3 transition-colors',
                                        item.id === participant.id
                                            ? 'border-leaf bg-leaf/10'
                                            : 'border-transparent hover:bg-butter',
                                    )}
                            >
                                <div className="flex items-center gap-3">
                                    <ParticipantAvatar
                                        name={item.name}
                                        className="size-8"
                                    />
                                    <div>
                                        <p className="text-sm font-bold">
                                            {item.name}
                                        </p>
                                        <p className="numeric text-xs text-deep/70">
                                            {item.status === 'draft'
                                                ? 'DRAF TERSIMPAN'
                                                : item.participant_number}
                                        </p>
                                    </div>
                                </div>
                                {item.status === 'submitted' ? (
                                    <span className="flex size-5 items-center justify-center rounded-full bg-leaf text-white">
                                        <Check className="size-3" />
                                    </span>
                                ) : (
                                    <span
                                        className={cn(
                                            'size-5 rounded-full border-2',
                                            item.id === participant.id
                                                ? 'border-leaf'
                                                : 'border-border',
                                        )}
                                    />
                                )}
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Main workspace */}
                <div className="flex-1 overflow-y-auto">
                    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 md:p-8">
                        {/* Round stepper */}
                        <ol className="flex items-center justify-center gap-2">
                            {rounds.map((round, index) => (
                                <li
                                    key={round.id}
                                    className="flex items-center gap-2"
                                >
                                    {index > 0 && (
                                        <span className="h-px w-10 bg-border sm:w-16" />
                                    )}
                                    <div className="flex flex-col items-center gap-1">
                                        <span
                                            className={cn(
                                            'numeric flex size-8 items-center justify-center rounded-full border-2 text-sm font-bold',
                                            round.status === 'locked' &&
                                                'border-leaf bg-leaf text-white',
                                            round.status === 'active' &&
                                                'border-leaf text-leaf',
                                            round.status === 'pending' &&
                                                'border-border text-deep/70',
                                            )}
                                        >
                                            {round.status === 'locked' ? (
                                                <Check className="size-4" />
                                            ) : (
                                                round.sequence
                                            )}
                                        </span>
                                        <span
                                            className={cn(
                                                'text-xs font-bold',
                                                round.status === 'active'
                                                    ? 'text-leaf'
                                                    : 'text-deep/70',
                                            )}
                                        >
                                            {round.name}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ol>

                        {/* Participant profile */}
                        <Card>
                            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                                <div className="flex items-center gap-4">
                                    <ParticipantAvatar
                                        name={participant.name}
                                        className="size-14"
                                    />
                    <div>
                        <h1 className="font-heading text-xl font-bold text-deep">
                            {participant.name}
                        </h1>
                        <p className="text-sm text-deep/70">
                                            {[
                                                participant.participant_number,
                                                participant.institution,
                                            ]
                                                .filter(Boolean)
                                                .join(' · ')}
                                        </p>
                                    </div>
                                </div>
                                {participant.category && (
                                    <div className="text-right">
                                        <p className="text-xs font-bold tracking-wider text-deep/70 uppercase">
                                            Kategori
                                        </p>
                                        <p className="font-heading font-bold text-leaf">
                                            {participant.category}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {submitted && (
                            <div className="rounded-2xl border-2 border-leaf/40 bg-leaf/10 p-4 text-center text-sm text-leaf">
                                Nilai untuk peserta ini sudah dikirim dan tidak
                                dapat diubah.
                            </div>
                        )}

                        {/* Criteria */}
                        <div className="space-y-4">
                            <p className="text-xs font-bold tracking-wider text-deep/70 uppercase">
                                Kriteria Penilaian — {activeRound.name}
                            </p>
                            {criteria.map((criterion) => {
                                const value =
                                    form.data.scores[criterion.id] ?? null;

                                return (
                                    <Card key={criterion.id}>
                                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                            <div>
                                                <h3 className="font-heading text-lg font-bold text-deep">
                                                    {criterion.name}
                                                </h3>
                                                {criterion.description && (
                                                    <p className="text-sm text-deep/70">
                                                        {
                                                            criterion.description
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className="numeric shrink-0 rounded-full bg-sun/20 text-papaya"
                                            >
                                                Bobot {criterion.weight}%
                                            </Badge>
                                        </CardHeader>
                                        <CardContent className="flex items-center gap-6">
                                            <div className="flex-1">
                                                <Slider
                                                    value={[
                                                        value ??
                                                            criterion.min_score,
                                                    ]}
                                                    min={criterion.min_score}
                                                    max={criterion.max_score}
                                                    step={1}
                                                    disabled={submitted}
                                                    onValueChange={([next]) =>
                                                        form.setData('scores', {
                                                            ...form.data
                                                                .scores,
                                                            [criterion.id]:
                                                                next,
                                                        })
                                                    }
                                                />
                                                <div className="numeric mt-2 flex justify-between text-xs text-deep/70">
                                                    <span>
                                                        {criterion.min_score}
                                                    </span>
                                                    <span>
                                                        {Math.round(
                                                            (criterion.min_score +
                                                                criterion.max_score) /
                                                                2,
                                                        )}
                                                    </span>
                                                    <span>
                                                        {criterion.max_score}
                                                    </span>
                                                </div>
                                            </div>
                                            <Input
                                                type="number"
                                                value={value ?? ''}
                                                min={criterion.min_score}
                                                max={criterion.max_score}
                                                disabled={submitted}
                                                onChange={(e) =>
                                                    form.setData('scores', {
                                                        ...form.data.scores,
                                                        [criterion.id]:
                                                            e.target.value ===
                                                            ''
                                                                ? null
                                                                : Math.min(
                                                                      criterion.max_score,
                                                                      Math.max(
                                                                          criterion.min_score,
                                                                          Number(
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                          ),
                                                                      ),
                                                                  ),
                                                    })
                                                }
                                                className="numeric h-14 w-20 text-center font-heading text-xl font-bold"
                                            />
                                        </CardContent>
                                    </Card>
                                );
                            })}
                            <InputError
                                message={
                                    (form.errors as Record<string, string>)
                                        .scores
                                }
                            />
                        </div>

                        {/* Total & actions */}
                        <div className="rounded-2xl border-2 border-dashed border-leaf/40 bg-leaf/50 p-5 text-center">
                            <p className="text-xs font-bold tracking-wider text-deep/70 uppercase">
                                Total Skor Terhitung
                            </p>
                            <p className="numeric font-heading text-5xl font-bold text-leaf">
                                {totalScore.toFixed(2)}
                            </p>
                            <p className="mt-1 text-xs text-deep/70">
                                Skor berbobot dari {criteria.length} kriteria
                            </p>
                        </div>

                        {!submitted && (
                            <div className="flex flex-wrap justify-end gap-3 pb-8">
                                <Button
                                    variant="outline"
                                    disabled={form.processing}
                                    onClick={() => saveDraft()}
                                >
                                    <Save className="size-4" />
                                    Simpan Draf
                                </Button>
                                <Button
                                    disabled={form.processing || !allFilled}
                                    onClick={() => setConfirmSubmit(true)}
                                >
                                    <Send className="size-4" />
                                    Kirim Nilai Final
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={confirmSubmit} onOpenChange={setConfirmSubmit}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Kirim Nilai Final</DialogTitle>
                        <DialogDescription className="text-deep/70">
                            Kirim nilai untuk{' '}
                            <strong>{participant.name}</strong> dengan total
                            skor{' '}
                            <strong className="numeric">
                                {totalScore.toFixed(2)}
                            </strong>
                            ? Setelah dikirim, nilai tidak dapat diubah.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmSubmit(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            disabled={form.processing}
                            onClick={submitFinal}
                        >
                            Kirim
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Scoring.layout = () => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Penilaian',
            href: scoring.index(),
        },
    ],
});
