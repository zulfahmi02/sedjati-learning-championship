import { Head, router, usePoll } from '@inertiajs/react';
import {
    ExternalLink,
    Gavel,
    LayoutGrid,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useState } from 'react';
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
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { dashboard } from '@/routes/admin';
import publication from '@/routes/admin/publication';
import { index as leaderboardIndex } from '@/routes/leaderboard';

type PanelStatus = {
    id: number;
    name: string;
    judge: string | null;
    participants_count: number;
    scored_count: number;
};

type Props = {
    stats: {
        participants: number;
        judges: number;
        activeJudges: number;
        panels: number;
        panelsWithJudge: number;
        rounds: number;
        lockedRounds: number;
        progress: number;
        submittedInRound: number;
        expectedInRound: number;
    };
    activeRound: {
        id: number;
        name: string;
        sequence: number;
        weight: number;
    } | null;
    panelStatus: PanelStatus[];
    resultsPublished: boolean;
};

export default function AdminDashboard({
    stats,
    activeRound,
    panelStatus,
    resultsPublished,
}: Props) {
    usePoll(10000);

    const [confirmPublish, setConfirmPublish] = useState(false);

    const togglePublication = () => {
        router.put(
            publication.update().url,
            { publish: !resultsPublished },
            {
                preserveScroll: true,
                onSuccess: () => setConfirmPublish(false),
            },
        );
    };

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h1 className="font-heading text-2xl font-bold text-deep">
                            Ringkasan Dashboard
                        </h1>
                        <p className="text-sm font-semibold text-ink/70">
                            {activeRound
                                ? `Ronde berlangsung: ${activeRound.name}`
                                : 'Belum ada ronde yang berlangsung.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge
                            status={
                                resultsPublished ? 'published' : 'unpublished'
                            }
                        />
                        {resultsPublished && (
                            <Button variant="ghost" size="sm" asChild>
                                <a
                                    href={leaderboardIndex().url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ExternalLink className="size-3.5" />
                                    Lihat
                                </a>
                            </Button>
                        )}
                        <Button
                            variant={resultsPublished ? 'outline' : 'default'}
                            size="sm"
                            onClick={() => setConfirmPublish(true)}
                        >
                            {resultsPublished
                                ? 'Batalkan Publikasi'
                                : 'Publikasikan Hasil'}
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Total Peserta"
                        value={stats.participants}
                        icon={Users}
                        detail="Terdaftar dalam lomba"
                    />
                    <StatCard
                        label="Total Juri"
                        value={stats.judges}
                        icon={Gavel}
                        detail={`${stats.activeJudges} juri aktif`}
                    />
                    <StatCard
                        label="Panel"
                        value={stats.panels}
                        icon={LayoutGrid}
                        detail={`${stats.panelsWithJudge} panel dengan juri`}
                    />
                    <StatCard
                        label="Progres Penilaian"
                        value={`${stats.progress}%`}
                        icon={TrendingUp}
                        detail={
                            <div className="flex flex-col gap-1.5">
                                <Progress value={stats.progress} />
                                <span className="font-bold text-deep/70">
                                    {stats.submittedInRound}/
                                    {stats.expectedInRound} dinilai
                                </span>
                            </div>
                        }
                    />
                </div>

                <div className="rounded-2xl border-2 border-leaf/10 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-leaf/10 px-5 py-4">
                        <h2 className="font-heading text-lg font-bold text-deep">
                            Status Penilaian Panel
                        </h2>
                        <span className="text-xs font-bold text-deep/60">
                            Diperbarui otomatis setiap 10 detik
                        </span>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-butter">
                                <TableHead className="font-heading text-xs font-bold tracking-wider text-deep/70 uppercase">
                                    Nama Panel
                                </TableHead>
                                <TableHead className="font-heading text-xs font-bold tracking-wider text-deep/70 uppercase">
                                    Juri
                                </TableHead>
                                <TableHead className="text-right font-heading text-xs font-bold tracking-wider text-deep/70 uppercase">
                                    Peserta
                                </TableHead>
                                <TableHead className="text-right font-heading text-xs font-bold tracking-wider text-deep/70 uppercase">
                                    Dinilai
                                </TableHead>
                                <TableHead className="font-heading text-xs font-bold tracking-wider text-deep/70 uppercase">
                                    Status
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {panelStatus.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-8 text-center font-semibold text-deep/70"
                                    >
                                        Belum ada panel. Buat panel terlebih
                                        dahulu di menu Panel.
                                    </TableCell>
                                </TableRow>
                            )}
                            {panelStatus.map((panel) => {
                                const done =
                                    panel.participants_count > 0 &&
                                    panel.scored_count >=
                                        panel.participants_count;

                                return (
                                    <TableRow
                                        key={panel.id}
                                        className="hover:bg-butter/50"
                                    >
                                        <TableCell className="font-bold text-deep">
                                            {panel.name}
                                        </TableCell>
                                        <TableCell>
                                            {panel.judge ?? (
                                                <span className="font-semibold text-deep/60 italic">
                                                    Belum ada juri
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-deep">
                                            {panel.participants_count}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-deep">
                                            {panel.scored_count}
                                        </TableCell>
                                        <TableCell>
                                            {activeRound ? (
                                                <StatusBadge
                                                    status={
                                                        done
                                                            ? 'scored'
                                                            : 'pending'
                                                    }
                                                    label={
                                                        done
                                                            ? 'Selesai'
                                                            : 'Menilai'
                                                    }
                                                />
                                            ) : (
                                                <StatusBadge status="pending" />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Dialog open={confirmPublish} onOpenChange={setConfirmPublish}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {resultsPublished
                                ? 'Batalkan Publikasi Hasil'
                                : 'Publikasikan Hasil'}
                        </DialogTitle>
                        <DialogDescription>
                            {resultsPublished
                                ? 'Leaderboard tidak akan lagi dapat diakses oleh publik. Lanjutkan?'
                                : 'Leaderboard akan dapat diakses publik tanpa login. Jika penilaian masih berlangsung, klasemen ditandai sebagai sementara. Lanjutkan?'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmPublish(false)}
                        >
                            Batal
                        </Button>
                        <Button onClick={togglePublication}>
                            {resultsPublished
                                ? 'Batalkan Publikasi'
                                : 'Publikasikan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

AdminDashboard.layout = () => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
});
