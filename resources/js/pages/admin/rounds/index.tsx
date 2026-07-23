import { Form, Head, router } from '@inertiajs/react';
import { Lock, Pencil, Play, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { StatusBadge } from '@/components/slc/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import roundRoutes, {
    index as roundsIndex,
    status as roundStatus,
} from '@/routes/admin/rounds';
import criteria from '@/routes/admin/rounds/criteria';
import type { Criterion, Round } from '@/types';

type Props = {
    rounds: Round[];
    totalWeight: number;
};

export default function RoundsIndex({ rounds, totalWeight }: Props) {
    const [dialog, setDialog] = useState<
        | { mode: 'create-round' }
        | { mode: 'edit-round'; round: Round }
        | { mode: 'delete-round'; round: Round }
        | { mode: 'create-criterion'; round: Round }
        | { mode: 'edit-criterion'; round: Round; criterion: Criterion }
        | { mode: 'activate'; round: Round }
        | { mode: 'lock'; round: Round }
        | null
    >(null);

    const editingRound = dialog?.mode === 'edit-round' ? dialog.round : null;
    const editingCriterion =
        dialog?.mode === 'edit-criterion' ? dialog.criterion : null;
    const criterionRound =
        dialog?.mode === 'create-criterion' || dialog?.mode === 'edit-criterion'
            ? dialog.round
            : null;

    return (
        <>
            <Head title="Manajemen Ronde" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="font-heading text-2xl font-bold text-deep">
                            Manajemen Ronde
                        </h1>
                        <p className="text-sm text-deep/70">
                            Total bobot ronde:{' '}
                            <span
                                className={`font-bold numeric ${totalWeight === 100 ? 'text-leaf' : 'text-destructive'}`}
                            >
                                {totalWeight}%
                            </span>{' '}
                            {totalWeight !== 100 && '(harus 100%)'}
                        </p>
                    </div>
                    <Button onClick={() => setDialog({ mode: 'create-round' })}>
                        <Plus className="size-4" />
                        Tambah Ronde
                    </Button>
                </div>

                {rounds.length === 0 && (
                    <div className="rounded-2xl border-2 border-dashed border-leaf/10 bg-white p-10 text-center text-deep/70">
                        Belum ada ronde. Tambahkan ronde perlombaan, misal:
                        Penyisihan, Semifinal, Final.
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    {rounds.map((round) => {
                        const criteriaWeight = (round.criteria ?? []).reduce(
                            (sum, criterion) => sum + criterion.weight,
                            0,
                        );

                        return (
                            <Card key={round.id}>
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="flex size-9 items-center justify-center rounded-full bg-leaf/10 font-heading font-bold text-leaf numeric">
                                            {round.sequence}
                                        </span>
                                        <div>
                                            <CardTitle className="font-heading text-lg">
                                                {round.name}
                                            </CardTitle>
                                            <p className="text-sm text-deep/70">
                                                Bobot ronde:{' '}
                                                <span className="numeric">
                                                    {round.weight}%
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={round.status} />
                                        {round.status === 'pending' && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        setDialog({
                                                            mode: 'activate',
                                                            round,
                                                        })
                                                    }
                                                >
                                                    <Play className="size-3.5" />
                                                    Aktifkan
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8"
                                                    onClick={() =>
                                                        setDialog({
                                                            mode: 'edit-round',
                                                            round,
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
                                                            mode: 'delete-round',
                                                            round,
                                                        })
                                                    }
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </>
                                        )}
                                        {round.status === 'active' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setDialog({
                                                        mode: 'lock',
                                                        round,
                                                    })
                                                }
                                            >
                                                <Lock className="size-3.5" />
                                                Kunci
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-2 flex items-center justify-between">
                                        <p className="text-xs font-bold tracking-wider text-deep/70 uppercase">
                                            Kriteria Penilaian
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className={`rounded-full numeric ${criteriaWeight === 100 ? '' : 'border-destructive text-destructive'}`}
                                            >
                                                Σ bobot: {criteriaWeight}%
                                            </Badge>
                                            {round.status === 'pending' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        setDialog({
                                                            mode: 'create-criterion',
                                                            round,
                                                        })
                                                    }
                                                >
                                                    <Plus className="size-3.5" />
                                                    Kriteria
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    {(round.criteria ?? []).length === 0 ? (
                                        <p className="py-3 text-center text-sm text-deep/70">
                                            Belum ada kriteria. Total bobot
                                            kriteria harus 100% sebelum ronde
                                            dapat diaktifkan.
                                        </p>
                                    ) : (
                                        <Table>
                                            <TableHeader className="[&_tr:first-child]:overflow-hidden [&_tr:first-child]:rounded-t-xl">
                                                <TableRow className="bg-butter">
                                                    <TableHead className="font-bold text-deep/70">
                                                        Kriteria
                                                    </TableHead>
                                                    <TableHead className="text-right font-bold text-deep/70">
                                                        Bobot
                                                    </TableHead>
                                                    <TableHead className="text-right font-bold text-deep/70">
                                                        Rentang
                                                    </TableHead>
                                                    {round.status ===
                                                        'pending' && (
                                                        <TableHead className="w-20 text-right font-bold text-deep/70">
                                                            Aksi
                                                        </TableHead>
                                                    )}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {(round.criteria ?? []).map(
                                                    (criterion) => (
                                                        <TableRow
                                                            key={criterion.id}
                                                        >
                                                            <TableCell>
                                                                <p className="font-bold">
                                                                    {
                                                                        criterion.name
                                                                    }
                                                                </p>
                                                                {criterion.description && (
                                                                    <p className="text-xs text-deep/70">
                                                                        {
                                                                            criterion.description
                                                                        }
                                                                    </p>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right numeric">
                                                                {
                                                                    criterion.weight
                                                                }
                                                                %
                                                            </TableCell>
                                                            <TableCell className="text-right numeric">
                                                                {
                                                                    criterion.min_score
                                                                }
                                                                –
                                                                {
                                                                    criterion.max_score
                                                                }
                                                            </TableCell>
                                                            {round.status ===
                                                                'pending' && (
                                                                <TableCell className="text-right">
                                                                    <div className="flex justify-end gap-1">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="size-7"
                                                                            onClick={() =>
                                                                                setDialog(
                                                                                    {
                                                                                        mode: 'edit-criterion',
                                                                                        round,
                                                                                        criterion,
                                                                                    },
                                                                                )
                                                                            }
                                                                        >
                                                                            <Pencil className="size-3.5" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="size-7 text-destructive hover:text-destructive"
                                                                            onClick={() =>
                                                                                router.delete(
                                                                                    criteria.destroy(
                                                                                        {
                                                                                            round: round.id,
                                                                                            criterion:
                                                                                                criterion.id,
                                                                                        },
                                                                                    )
                                                                                        .url,
                                                                                    {
                                                                                        preserveScroll: true,
                                                                                    },
                                                                                )
                                                                            }
                                                                        >
                                                                            <Trash2 className="size-3.5" />
                                                                        </Button>
                                                                    </div>
                                                                </TableCell>
                                                            )}
                                                        </TableRow>
                                                    ),
                                                )}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Create / Edit round dialog */}
            <Dialog
                open={
                    dialog?.mode === 'create-round' ||
                    dialog?.mode === 'edit-round'
                }
                onOpenChange={(open) => !open && setDialog(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingRound ? 'Edit Ronde' : 'Tambah Ronde'}
                        </DialogTitle>
                        <DialogDescription className="text-deep/70">
                            Total bobot seluruh ronde harus 100% agar
                            perhitungan nilai akhir valid.
                        </DialogDescription>
                    </DialogHeader>
                    <Form
                        {...(editingRound
                            ? roundRoutes.update.form(editingRound.id)
                            : roundRoutes.store.form())}
                        options={{ preserveScroll: true }}
                        onSuccess={() => setDialog(null)}
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="round-name">
                                        Nama Ronde
                                    </Label>
                                    <Input
                                        id="round-name"
                                        name="name"
                                        defaultValue={editingRound?.name}
                                        placeholder="Penyisihan"
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="round-sequence">
                                            Urutan
                                        </Label>
                                        <Input
                                            id="round-sequence"
                                            name="sequence"
                                            type="number"
                                            min={1}
                                            defaultValue={
                                                editingRound?.sequence ??
                                                rounds.length + 1
                                            }
                                            required
                                        />
                                        <InputError message={errors.sequence} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="round-weight">
                                            Bobot (%)
                                        </Label>
                                        <Input
                                            id="round-weight"
                                            name="weight"
                                            type="number"
                                            min={1}
                                            max={100}
                                            defaultValue={editingRound?.weight}
                                            required
                                        />
                                        <InputError message={errors.weight} />
                                    </div>
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
                                        {editingRound ? 'Simpan' : 'Tambah'}
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Create / Edit criterion dialog */}
            <Dialog
                open={
                    dialog?.mode === 'create-criterion' ||
                    dialog?.mode === 'edit-criterion'
                }
                onOpenChange={(open) => !open && setDialog(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCriterion
                                ? 'Edit Kriteria'
                                : 'Tambah Kriteria'}
                        </DialogTitle>
                        <DialogDescription className="text-deep/70">
                            Kriteria untuk ronde{' '}
                            <strong>{criterionRound?.name}</strong>. Total bobot
                            kriteria harus 100%.
                        </DialogDescription>
                    </DialogHeader>
                    {criterionRound && (
                        <Form
                            {...(editingCriterion
                                ? criteria.update.form({
                                      round: criterionRound.id,
                                      criterion: editingCriterion.id,
                                  })
                                : criteria.store.form(criterionRound.id))}
                            options={{ preserveScroll: true }}
                            onSuccess={() => setDialog(null)}
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="criterion-name">
                                            Nama Kriteria
                                        </Label>
                                        <Input
                                            id="criterion-name"
                                            name="name"
                                            defaultValue={
                                                editingCriterion?.name
                                            }
                                            placeholder="Technique"
                                            required
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="criterion-description">
                                            Deskripsi
                                        </Label>
                                        <Textarea
                                            id="criterion-description"
                                            name="description"
                                            defaultValue={
                                                editingCriterion?.description ??
                                                ''
                                            }
                                            placeholder="Struktur materi dan penggunaan alat bantu."
                                            rows={2}
                                        />
                                        <InputError
                                            message={errors.description}
                                        />
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="criterion-weight">
                                                Bobot (%)
                                            </Label>
                                            <Input
                                                id="criterion-weight"
                                                name="weight"
                                                type="number"
                                                min={1}
                                                max={100}
                                                defaultValue={
                                                    editingCriterion?.weight
                                                }
                                                required
                                            />
                                            <InputError
                                                message={errors.weight}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="criterion-sequence">
                                                Urutan
                                            </Label>
                                            <Input
                                                id="criterion-sequence"
                                                name="sequence"
                                                type="number"
                                                min={1}
                                                defaultValue={
                                                    editingCriterion?.sequence ??
                                                    (criterionRound.criteria
                                                        ?.length ?? 0) + 1
                                                }
                                                required
                                            />
                                            <InputError
                                                message={errors.sequence}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="criterion-min">
                                                Nilai Minimum
                                            </Label>
                                            <Input
                                                id="criterion-min"
                                                name="min_score"
                                                type="number"
                                                min={0}
                                                max={100}
                                                defaultValue={
                                                    editingCriterion?.min_score ??
                                                    0
                                                }
                                                required
                                            />
                                            <InputError
                                                message={errors.min_score}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="criterion-max">
                                                Nilai Maksimum
                                            </Label>
                                            <Input
                                                id="criterion-max"
                                                name="max_score"
                                                type="number"
                                                min={1}
                                                max={100}
                                                defaultValue={
                                                    editingCriterion?.max_score ??
                                                    100
                                                }
                                                required
                                            />
                                            <InputError
                                                message={errors.max_score}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setDialog(null)}
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {editingCriterion
                                                ? 'Simpan'
                                                : 'Tambah'}
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Activate / Lock / Delete confirmations */}
            <Dialog
                open={
                    dialog?.mode === 'activate' ||
                    dialog?.mode === 'lock' ||
                    dialog?.mode === 'delete-round'
                }
                onOpenChange={(open) => !open && setDialog(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {dialog?.mode === 'activate' && 'Aktifkan Ronde'}
                            {dialog?.mode === 'lock' && 'Kunci Ronde'}
                            {dialog?.mode === 'delete-round' && 'Hapus Ronde'}
                        </DialogTitle>
                        <DialogDescription className="text-deep/70">
                            {dialog?.mode === 'activate' &&
                                `Aktifkan ronde ${dialog.round.name}? Juri dapat mulai memberikan nilai pada ronde ini.`}
                            {dialog?.mode === 'lock' &&
                                `Kunci ronde ${dialog.round.name}? Seluruh nilai pada ronde ini tidak dapat diubah lagi. Tindakan ini tidak dapat dibatalkan.`}
                            {dialog?.mode === 'delete-round' &&
                                `Hapus ronde ${dialog.round.name} beserta seluruh kriterianya?`}
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
                            variant={
                                dialog?.mode === 'delete-round'
                                    ? 'destructive'
                                    : 'default'
                            }
                            onClick={() => {
                                if (!dialog) {
                                    return;
                                }

                                if (dialog.mode === 'delete-round') {
                                    router.delete(
                                        roundRoutes.destroy(dialog.round.id)
                                            .url,
                                        {
                                            preserveScroll: true,
                                            onSuccess: () => setDialog(null),
                                        },
                                    );
                                } else if (
                                    dialog.mode === 'activate' ||
                                    dialog.mode === 'lock'
                                ) {
                                    router.put(
                                        roundStatus(dialog.round.id).url,
                                        {
                                            status:
                                                dialog.mode === 'activate'
                                                    ? 'active'
                                                    : 'locked',
                                        },
                                        {
                                            preserveScroll: true,
                                            onSuccess: () => setDialog(null),
                                        },
                                    );
                                }
                            }}
                        >
                            {dialog?.mode === 'activate' && 'Aktifkan'}
                            {dialog?.mode === 'lock' && 'Kunci'}
                            {dialog?.mode === 'delete-round' && 'Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

RoundsIndex.layout = () => ({
    breadcrumbs: [
        {
            title: 'Ronde',
            href: roundsIndex(),
        },
    ],
});
