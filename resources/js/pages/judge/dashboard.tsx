import { Head, Link } from '@inertiajs/react';
import { ClipboardPen, ListChecks, Users } from 'lucide-react';
import { ParticipantAvatar } from '@/components/slc/participant-avatar';
import { StatCard } from '@/components/slc/stat-card';
import { StatusBadge } from '@/components/slc/status-badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { dashboard } from '@/routes/judge';
import scoring from '@/routes/judge/scoring';

type QueueItem = {
    id: number;
    participant_number: string;
    name: string;
    institution: string | null;
    status: 'pending' | 'draft' | 'submitted';
};

type Props = {
    panel: { id: number; name: string; description: string | null } | null;
    activeRound: {
        id: number;
        name: string;
        sequence: number;
        weight: number;
    } | null;
    participants: QueueItem[];
    stats: {
        total: number;
        submitted: number;
        remaining: number;
    };
};

export default function JudgeDashboard({
    panel,
    activeRound,
    participants,
    stats,
}: Props) {
    return (
        <>
            <Head title="Dashboard Juri" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="font-heading text-2xl font-semibold">
                            Dashboard Juri
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {panel
                                ? `Panel Anda: ${panel.name}`
                                : 'Anda belum ditugaskan ke panel mana pun.'}
                            {activeRound &&
                                ` · Ronde berlangsung: ${activeRound.name}`}
                        </p>
                    </div>
                    {panel && activeRound && stats.remaining > 0 && (
                        <Button asChild>
                            <Link href={scoring.index()}>
                                <ClipboardPen className="size-4" />
                                Mulai Menilai
                            </Link>
                        </Button>
                    )}
                </div>

                {!panel && (
                    <div className="rounded-lg border border-dashed bg-card p-10 text-center text-muted-foreground">
                        Hubungi administrator untuk penugasan panel Anda.
                    </div>
                )}

                {panel && !activeRound && (
                    <div className="rounded-lg border border-dashed bg-card p-10 text-center text-muted-foreground">
                        Belum ada ronde yang berlangsung. Penilaian akan
                        terbuka saat administrator mengaktifkan ronde.
                    </div>
                )}

                {panel && activeRound && (
                    <>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <StatCard
                                label="Peserta Panel"
                                value={stats.total}
                                icon={Users}
                            />
                            <StatCard
                                label="Sudah Dinilai"
                                value={stats.submitted}
                                icon={ListChecks}
                            />
                            <StatCard
                                label="Belum Dinilai"
                                value={stats.remaining}
                                icon={ClipboardPen}
                            />
                        </div>

                        <div className="rounded-lg border bg-card">
                            <div className="border-b px-5 py-4">
                                <h2 className="font-heading text-lg font-semibold">
                                    Daftar Peserta — {activeRound.name}
                                </h2>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-24">
                                            No.
                                        </TableHead>
                                        <TableHead>Peserta</TableHead>
                                        <TableHead>Institusi</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-28 text-right">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {participants.map((participant) => (
                                        <TableRow key={participant.id}>
                                            <TableCell className="numeric text-muted-foreground">
                                                {
                                                    participant.participant_number
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <ParticipantAvatar
                                                        name={participant.name}
                                                    />
                                                    <span className="font-medium">
                                                        {participant.name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {participant.institution ??
                                                    '—'}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge
                                                    status={
                                                        participant.status ===
                                                        'pending'
                                                            ? 'registered'
                                                            : participant.status
                                                    }
                                                    label={
                                                        participant.status ===
                                                        'pending'
                                                            ? 'Belum Dinilai'
                                                            : undefined
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant={
                                                        participant.status ===
                                                        'submitted'
                                                            ? 'outline'
                                                            : 'default'
                                                    }
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={scoring.show(
                                                            participant.id,
                                                        )}
                                                    >
                                                        {participant.status ===
                                                        'submitted'
                                                            ? 'Lihat'
                                                            : 'Nilai'}
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

JudgeDashboard.layout = () => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
});
