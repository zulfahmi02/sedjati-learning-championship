import { Form, Head, router } from '@inertiajs/react';
import { Pencil, Search, Trash2, Upload, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { DataTablePagination } from '@/components/slc/data-table-pagination';
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
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
import participantRoutes, { importMethod } from '@/routes/admin/participants';
import { index as participantsIndex } from '@/routes/admin/participants';
import type { Paginated, Panel, Participant } from '@/types';

type Props = {
    participants: Paginated<Participant>;
    panels: Pick<Panel, 'id' | 'name' | 'judge_id'>[];
    filters: {
        search: string;
        panel: number | null;
        status: string | null;
    };
    stats: {
        total: number;
        scored: number;
    };
};

const NO_PANEL = 'none';

export default function ParticipantsIndex({
    participants,
    panels,
    filters,
    stats,
}: Props) {
    const [dialog, setDialog] = useState<
        | { mode: 'create' }
        | { mode: 'edit'; participant: Participant }
        | { mode: 'import' }
        | { mode: 'delete'; participant: Participant }
        | null
    >(null);

    const [search, setSearch] = useState(filters.search);

    const applyFilters = (overrides: Record<string, unknown> = {}) => {
        router.get(
            participantsIndex().url,
            {
                search: search || undefined,
                panel: filters.panel ?? undefined,
                status: filters.status ?? undefined,
                ...overrides,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const completionRate = useMemo(
        () =>
            stats.total > 0
                ? Math.round((stats.scored / stats.total) * 100)
                : 0,
        [stats],
    );

    const editing = dialog?.mode === 'edit' ? dialog.participant : null;

    return (
        <>
            <Head title="Manajemen Peserta" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="font-heading text-2xl font-bold text-foreground">
                            Manajemen Peserta
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Total{' '}
                            <span className="font-bold text-foreground numeric">
                                {stats.total}
                            </span>{' '}
                            peserta · Tingkat penilaian{' '}
                            <span className="font-bold text-foreground numeric">
                                {completionRate}%
                            </span>
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDialog({ mode: 'import' })}
                        >
                            <Upload className="size-4" />
                            Import Excel
                        </Button>
                        <Button onClick={() => setDialog({ mode: 'create' })}>
                            <UserPlus className="size-4" />
                            Tambah Peserta
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-border bg-card p-4 text-card-foreground">
                    <div className="relative min-w-56 flex-1">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && applyFilters()
                            }
                            onBlur={() =>
                                search !== filters.search && applyFilters()
                            }
                            placeholder="Cari nama, nomor, atau institusi peserta..."
                            className="pl-9"
                        />
                    </div>
                    <Select
                        value={filters.panel?.toString() ?? 'all'}
                        onValueChange={(value) =>
                            applyFilters({
                                panel: value === 'all' ? undefined : value,
                            })
                        }
                    >
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="Semua Panel" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Panel</SelectItem>
                            {panels.map((panel) => (
                                <SelectItem
                                    key={panel.id}
                                    value={panel.id.toString()}
                                >
                                    {panel.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={filters.status ?? 'all'}
                        onValueChange={(value) =>
                            applyFilters({
                                status: value === 'all' ? undefined : value,
                            })
                        }
                    >
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="registered">
                                Terdaftar
                            </SelectItem>
                            <SelectItem value="scored">Dinilai</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="rounded-2xl border-2 border-border bg-card text-card-foreground">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-secondary">
                                <TableHead className="w-16 font-bold text-muted-foreground">
                                    No.
                                </TableHead>
                                <TableHead className="font-bold text-muted-foreground">
                                    Nama Peserta
                                </TableHead>
                                <TableHead className="font-bold text-muted-foreground">
                                    Panel
                                </TableHead>
                                <TableHead className="font-bold text-muted-foreground">
                                    Institusi
                                </TableHead>
                                <TableHead className="font-bold text-muted-foreground">
                                    Status
                                </TableHead>
                                <TableHead className="w-24 text-right font-bold text-muted-foreground">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {participants.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        Belum ada peserta yang cocok.
                                    </TableCell>
                                </TableRow>
                            )}
                            {participants.data.map((participant) => (
                                <TableRow key={participant.id}>
                                    <TableCell className="text-muted-foreground numeric">
                                        {participant.participant_number}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <ParticipantAvatar
                                                name={participant.name}
                                            />
                                            <span className="font-bold">
                                                {participant.name}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {participant.panels?.[0]?.name ?? (
                                            <span className="text-muted-foreground italic">
                                                Belum ditugaskan
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {participant.institution ?? '—'}
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge
                                            status={
                                                participant.scored
                                                    ? 'scored'
                                                    : 'registered'
                                            }
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8"
                                                onClick={() =>
                                                    setDialog({
                                                        mode: 'edit',
                                                        participant,
                                                    })
                                                }
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8 text-destructive hover:text-destructive"
                                                onClick={() =>
                                                    setDialog({
                                                        mode: 'delete',
                                                        participant,
                                                    })
                                                }
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <DataTablePagination paginator={participants} />
                </div>
            </div>

            {/* Create / Edit dialog */}
            <Dialog
                open={dialog?.mode === 'create' || dialog?.mode === 'edit'}
                onOpenChange={(open) => !open && setDialog(null)}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? 'Edit Peserta' : 'Tambah Peserta'}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            {editing
                                ? 'Perbarui data peserta di bawah ini.'
                                : 'Isi data peserta baru di bawah ini.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form
                        {...(editing
                            ? participantRoutes.update.form(editing.id)
                            : participantRoutes.store.form())}
                        options={{ preserveScroll: true }}
                        onSuccess={() => setDialog(null)}
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="participant_number">
                                            Nomor Peserta
                                        </Label>
                                        <Input
                                            id="participant_number"
                                            name="participant_number"
                                            defaultValue={
                                                editing?.participant_number
                                            }
                                            placeholder="SLC-001"
                                            required
                                        />
                                        <InputError
                                            message={errors.participant_number}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Nama</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            defaultValue={editing?.name}
                                            placeholder="Nama lengkap"
                                            required
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="institution">
                                            Institusi
                                        </Label>
                                        <Input
                                            id="institution"
                                            name="institution"
                                            defaultValue={
                                                editing?.institution ?? ''
                                            }
                                            placeholder="Nama institusi"
                                        />
                                        <InputError
                                            message={errors.institution}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="category">
                                            Kategori
                                        </Label>
                                        <Input
                                            id="category"
                                            name="category"
                                            defaultValue={
                                                editing?.category ?? ''
                                            }
                                            placeholder="Mis. Public Speaking"
                                        />
                                        <InputError message={errors.category} />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="panel_id">Panel</Label>
                                    <Select
                                        name="panel_id"
                                        defaultValue={
                                            editing?.panels?.[0]?.id.toString() ??
                                            NO_PANEL
                                        }
                                    >
                                        <SelectTrigger id="panel_id">
                                            <SelectValue placeholder="Pilih panel" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={NO_PANEL}>
                                                Belum ditugaskan
                                            </SelectItem>
                                            {panels.map((panel) => (
                                                <SelectItem
                                                    key={panel.id}
                                                    value={panel.id.toString()}
                                                    disabled={!panel.judge_id}
                                                >
                                                    {panel.name}
                                                    {!panel.judge_id &&
                                                        ' (belum ada juri)'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.panel_id} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="notes">Catatan</Label>
                                    <Textarea
                                        id="notes"
                                        name="notes"
                                        defaultValue={editing?.notes ?? ''}
                                        placeholder="Catatan tambahan (opsional)"
                                        rows={2}
                                    />
                                    <InputError message={errors.notes} />
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setDialog(null)}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {editing ? 'Simpan' : 'Tambah'}
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Import dialog */}
            <Dialog
                open={dialog?.mode === 'import'}
                onOpenChange={(open) => !open && setDialog(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Import Peserta dari Excel</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Unggah berkas .xlsx atau .csv dengan kolom: nomor
                            peserta, nama, institusi, kategori. Baris pertama
                            dianggap judul kolom.
                        </DialogDescription>
                    </DialogHeader>
                    <Form
                        {...importMethod.form()}
                        options={{ preserveScroll: true }}
                        onSuccess={() => setDialog(null)}
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="file">Berkas</Label>
                                    <Input
                                        id="file"
                                        name="file"
                                        type="file"
                                        accept=".xlsx,.csv"
                                        required
                                    />
                                    <InputError message={errors.file} />
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setDialog(null)}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        Import
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete dialog */}
            <Dialog
                open={dialog?.mode === 'delete'}
                onOpenChange={(open) => !open && setDialog(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Hapus Peserta</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Yakin ingin menghapus{' '}
                            <strong>
                                {dialog?.mode === 'delete'
                                    ? dialog.participant.name
                                    : ''}
                            </strong>
                            ? Seluruh nilai peserta ini juga akan terhapus.
                            Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDialog(null)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (dialog?.mode === 'delete') {
                                    router.delete(
                                        participantRoutes.destroy(
                                            dialog.participant.id,
                                        ).url,
                                        {
                                            preserveScroll: true,
                                            onSuccess: () => setDialog(null),
                                        },
                                    );
                                }
                            }}
                        >
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

ParticipantsIndex.layout = () => ({
    breadcrumbs: [
        {
            title: 'Peserta',
            href: participantsIndex(),
        },
    ],
});
