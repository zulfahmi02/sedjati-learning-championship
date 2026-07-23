import { Head, router, usePoll } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    ClipboardList,
    Download,
    FileSpreadsheet,
    FileText,
    Users,
} from 'lucide-react';
import { ParticipantAvatar } from '@/components/slc/participant-avatar';
import { StatCard } from '@/components/slc/stat-card';
import { StatusBadge } from '@/components/slc/status-badge';
import { Button } from '@/components/ui/button';
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
import reports from '@/routes/admin/reports';
import type { Round } from '@/types';

type PendingParticipant = {
    id: number;
    participant_number: string;
    name: string;
};

type MatrixRow = {
    id: number;
    name: string;
    judge: { id: number; name: string; is_active: boolean } | null;
    expected: number;
    submitted: number;
    done: boolean;
    pendingParticipants: PendingParticipant[];
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
};

export default function Monitoring({
    rounds,
    selectedRound,
    matrix,
    totals,
}: Props) {
    usePoll(10000);

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
                    </>
                )}
            </div>
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
