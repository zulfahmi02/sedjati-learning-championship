import { Head, router, usePoll } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    ClipboardList,
    Download,
    FileSpreadsheet,
    FileText,
    RotateCcw,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { ParticipantAvatar } from '@/components/slc/participant-avatar';
import { StatCard } from '@/components/slc/stat-card';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import monitoring from '@/routes/admin/monitoring';
import scoreSheets from '@/routes/admin/monitoring/score-sheets';
import reports from '@/routes/admin/reports';
import type { Round } from '@/types';

type PendingParticipant = {
    id: number;
    participant_number: string;
    name: string;
};

type SubmittedParticipant = PendingParticipant & {
    score_sheet_id: number;
};

type ReopenTarget = SubmittedParticipant & {
    judgeName: string;
};

type MatrixRow = {
    id: number;
    name: string;
    judge: { id: number; name: string; is_active: boolean } | null;
    expected: number;
    submitted: number;
    done: boolean;
    pendingParticipants: PendingParticipant[];
    submittedParticipants: SubmittedParticipant[];
};

type ActivityLog = {
    id: number;
    event: string;
    actor_name: string;
    created_at: string;
    subject_name: string;
};

type Props = {
    rounds: Pick<Round, 'id' | 'name' | 'sequence' | 'status'>[];
    selectedRound: Pick<Round, 'id' | 'name' | 'sequence' | 'status'> | null;
    matrix: MatrixRow[];
    totals: {
        expected: number;
        submitted: number;
        unscored: number;
        judgesPending: number;
    };
    activities: ActivityLog[];
};

export default function Monitoring({
    rounds,
    selectedRound,
    matrix,
    totals,
    activities,
}: Props) {
    usePoll(10000);

    const [reopenTarget, setReopenTarget] = useState<ReopenTarget | null>(null);

    const reopenScoreSheet = () => {
        if (!reopenTarget) {
            return;
        }

        router.put(
            scoreSheets.reopen(reopenTarget.score_sheet_id).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => setReopenTarget(null),
            },
        );
    };

    const progress =
        totals.expected > 0
            ? Math.round((totals.submitted / totals.expected) * 100)
            : 0;

    return (
        <>
            <Head title="Monitoring" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="font-heading text-2xl font-bold text-deep">
                            Monitoring Penilaian
                        </h1>
                        <p className="text-sm text-deep/70">
                            Pantau progres penilaian per panel secara langsung.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedRound && (
                            <Select
                                value={selectedRound.id.toString()}
                                onValueChange={(value) =>
                                    router.get(
                                        monitoring.index().url,
                                        { round: value },
                                        { preserveState: true },
                                    )
                                }
                            >
                                <SelectTrigger className="w-44">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {rounds.map((round) => (
                                        <SelectItem
                                            key={round.id}
                                            value={round.id.toString()}
                                        >
                                            {round.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <Download className="size-4" />
                                    Laporan
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>
                                    Rekap Ranking
                                </DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <a
                                        href={
                                            reports.ranking({
                                                query: { format: 'xlsx' },
                                            }).url
                                        }
                                    >
                                        <FileSpreadsheet className="size-4" />
                                        Excel (.xlsx)
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <a
                                        href={
                                            reports.ranking({
                                                query: { format: 'pdf' },
                                            }).url
                                        }
                                    >
                                        <FileText className="size-4" />
                                        PDF
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>
                                    Rekap Nilai
                                </DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <a
                                        href={
                                            reports.scoreRecap({
                                                query: { format: 'xlsx' },
                                            }).url
                                        }
                                    >
                                        <FileSpreadsheet className="size-4" />
                                        Excel (.xlsx)
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <a
                                        href={
                                            reports.scoreRecap({
                                                query: { format: 'pdf' },
                                            }).url
                                        }
                                    >
                                        <FileText className="size-4" />
                                        PDF
                                    </a>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {!selectedRound && (
                    <div className="rounded-2xl border-2 border-dashed border-leaf/10 bg-white p-10 text-center text-deep/70">
                        Belum ada ronde. Buat ronde terlebih dahulu untuk mulai
                        memantau penilaian.
                    </div>
                )}

                {selectedRound && (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <StatCard
                                label="Progres Ronde"
                                value={`${progress}%`}
                                icon={ClipboardList}
                                detail={
                                    <div className="flex flex-col gap-1.5">
                                        <Progress value={progress} />
                                        <span className="numeric">
                                            {totals.submitted}/{totals.expected}{' '}
                                            penilaian
                                        </span>
                                    </div>
                                }
                            />
                            <StatCard
                                label="Peserta Belum Dinilai"
                                value={totals.unscored}
                                icon={Users}
                            />
                            <StatCard
                                label="Juri Belum Selesai"
                                value={totals.judgesPending}
                                icon={AlertTriangle}
                            />
                            <StatCard
                                label="Status Ronde"
                                value={
                                    <StatusBadge
                                        status={selectedRound.status}
                                    />
                                }
                                icon={CheckCircle2}
                                detail={selectedRound.name}
                            />
                        </div>

                        <div className="rounded-2xl border-2 border-leaf/10 bg-white">
                            <div className="flex items-center justify-between border-b px-5 py-4">
                                <h2 className="font-heading text-lg font-bold text-deep">
                                    Progres per Panel — {selectedRound.name}
                                </h2>
                                <span className="text-xs text-deep/70">
                                    Diperbarui otomatis setiap 10 detik
                                </span>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-butter">
                                        <TableHead className="font-bold text-deep/70">
                                            Panel
                                        </TableHead>
                                        <TableHead className="font-bold text-deep/70">
                                            Juri
                                        </TableHead>
                                        <TableHead className="text-right font-bold text-deep/70">
                                            Dinilai
                                        </TableHead>
                                        <TableHead className="w-56 font-bold text-deep/70">
                                            Progres
                                        </TableHead>
                                        <TableHead className="font-bold text-deep/70">
                                            Status
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {matrix.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="py-8 text-center text-deep/70"
                                            >
                                                Belum ada panel.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {matrix.map((row) => {
                                        const rowProgress =
                                            row.expected > 0
                                                ? Math.round(
                                                      (row.submitted /
                                                          row.expected) *
                                                          100,
                                                  )
                                                : 0;

                                        return (
                                            <TableRow key={row.id}>
                                                <TableCell className="font-bold">
                                                    {row.name}
                                                </TableCell>
                                                <TableCell>
                                                    {row.judge ? (
                                                        <span
                                                            className={
                                                                row.judge
                                                                    .is_active
                                                                    ? ''
                                                                    : 'text-destructive'
                                                            }
                                                        >
                                                            {row.judge.name}
                                                            {!row.judge
                                                                .is_active &&
                                                                ' (nonaktif)'}
                                                        </span>
                                                    ) : (
                                                        <span className="text-deep/60 italic">
                                                            Belum ada juri
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right numeric">
                                                    {row.submitted}/
                                                    {row.expected}
                                                </TableCell>
                                                <TableCell>
                                                    <Progress
                                                        value={rowProgress}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge
                                                        status={
                                                            row.done
                                                                ? 'scored'
                                                                : 'pending'
                                                        }
                                                        label={
                                                            row.done
                                                                ? 'Selesai'
                                                                : 'Berjalan'
                                                        }
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        {totals.unscored > 0 && (
                            <div className="rounded-2xl border-2 border-leaf/10 bg-white">
                                <div className="border-b px-5 py-4">
                                    <h2 className="font-heading text-lg font-bold text-deep">
                                        Peserta Belum Dinilai
                                    </h2>
                                </div>
                                <ul className="grid gap-1 p-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {matrix.flatMap((row) =>
                                        row.pendingParticipants.map(
                                            (participant) => (
                                                <li
                                                    key={participant.id}
                                                    className="flex items-center gap-3 rounded-2xl p-2"
                                                >
                                                    <ParticipantAvatar
                                                        name={participant.name}
                                                        className="size-8"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-bold">
                                                            {participant.name}
                                                        </p>
                                                        <p className="text-xs text-deep/70 numeric">
                                                            {
                                                                participant.participant_number
                                                            }{' '}
                                                            · {row.name}
                                                        </p>
                                                    </div>
                                                </li>
                                            ),
                                        ),
                                    )}
                                </ul>
                            </div>
                        )}

                        {selectedRound.status === 'active' &&
                            totals.submitted > 0 && (
                                <div className="rounded-2xl border-2 border-leaf/10 bg-white">
                                    <div className="border-b px-5 py-4">
                                        <h2 className="font-heading text-lg font-bold text-deep">
                                            Peserta Sudah Dinilai
                                        </h2>
                                        <p className="mt-1 text-sm text-deep/70">
                                            Buka kembali nilai jika juri perlu
                                            melakukan koreksi.
                                        </p>
                                    </div>
                                    <ul className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {matrix.flatMap((row) =>
                                            row.submittedParticipants.map(
                                                (participant) => (
                                                    <li
                                                        key={
                                                            participant.score_sheet_id
                                                        }
                                                        className="flex items-center gap-3 rounded-2xl border border-leaf/10 p-3"
                                                    >
                                                        <ParticipantAvatar
                                                            name={
                                                                participant.name
                                                            }
                                                            className="size-9"
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-bold">
                                                                {
                                                                    participant.name
                                                                }
                                                            </p>
                                                            <p className="text-xs text-deep/70 numeric">
                                                                {
                                                                    participant.participant_number
                                                                }{' '}
                                                                · {row.name}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                setReopenTarget(
                                                                    {
                                                                        ...participant,
                                                                        judgeName:
                                                                            row
                                                                                .judge
                                                                                ?.name ??
                                                                            'juri panel',
                                                                    },
                                                                )
                                                            }
                                                        >
                                                            <RotateCcw className="size-3.5" />
                                                            Buka kembali
                                                        </Button>
                                                    </li>
                                                ),
                                            ),
                                        )}
                                    </ul>
                                </div>
                            )}

                        {activities.length > 0 && (
                            <div className="rounded-2xl border-2 border-leaf/10 bg-white">
                                <div className="border-b px-5 py-4">
                                    <h2 className="font-heading text-lg font-bold text-deep">
                                        Aktivitas Terbaru
                                    </h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-butter/50">
                                                <TableHead className="w-40 font-bold text-deep/70">
                                                    Waktu
                                                </TableHead>
                                                <TableHead className="font-bold text-deep/70">
                                                    Aktivitas
                                                </TableHead>
                                                <TableHead className="font-bold text-deep/70">
                                                    Objek
                                                </TableHead>
                                                <TableHead className="font-bold text-deep/70">
                                                    Pengguna
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {activities.map((log) => (
                                                <TableRow key={log.id}>
                                                    <TableCell className="text-xs whitespace-nowrap text-deep/70">
                                                        {log.created_at}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-deep">
                                                        {log.event ===
                                                            'score.draft_saved' &&
                                                            'Menyimpan draf nilai'}
                                                        {log.event ===
                                                            'score.submitted' &&
                                                            'Mengirim nilai'}
                                                        {log.event ===
                                                            'score.live_incremented' &&
                                                            'Menambah nilai (Live)'}
                                                        {log.event ===
                                                            'score.live_adjusted' &&
                                                            'Mengubah nilai (Live)'}
                                                        {log.event ===
                                                            'score.reopened' &&
                                                            'Membuka kembali nilai'}
                                                        {log.event ===
                                                            'round.activated' &&
                                                            'Mengaktifkan ronde'}
                                                        {log.event ===
                                                            'round.locked' &&
                                                            'Mengunci ronde'}
                                                        {log.event ===
                                                            'event.publication_changed' &&
                                                            'Mengubah publikasi hasil'}
                                                        {![
                                                            'score.draft_saved',
                                                            'score.submitted',
                                                            'score.live_incremented',
                                                            'score.live_adjusted',
                                                            'score.reopened',
                                                            'round.activated',
                                                            'round.locked',
                                                            'event.publication_changed',
                                                        ].includes(log.event) &&
                                                            log.event}
                                                    </TableCell>
                                                    <TableCell className="text-deep">
                                                        {log.subject_name}
                                                    </TableCell>
                                                    <TableCell className="text-deep/80">
                                                        {log.actor_name}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <Dialog
                open={reopenTarget !== null}
                onOpenChange={(open) => !open && setReopenTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Buka kembali nilai?</DialogTitle>
                        <DialogDescription>
                            {reopenTarget && (
                                <>
                                    Nilai {reopenTarget.name} akan kembali
                                    menjadi draf agar {reopenTarget.judgeName}{' '}
                                    dapat mengoreksi dan mengirim ulang. Nilai
                                    per kriteria yang sudah tersimpan tidak akan
                                    dihapus.
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setReopenTarget(null)}
                        >
                            Batal
                        </Button>
                        <Button onClick={reopenScoreSheet}>
                            <RotateCcw className="size-4" />
                            Buka kembali nilai
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Monitoring.layout = () => ({
    breadcrumbs: [
        {
            title: 'Monitoring',
            href: monitoring.index(),
        },
    ],
});
