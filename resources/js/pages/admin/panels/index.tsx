import { Form, Head, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2, UserMinus, Users } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { ParticipantAvatar } from '@/components/slc/participant-avatar';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import panelRoutes, { index as panelsIndex } from '@/routes/admin/panels';
import panelParticipants from '@/routes/admin/panels/participants';
import type { JudgeSummary, Panel, ParticipantSummary } from '@/types';

type Props = {
    panels: Panel[];
    availableJudges: JudgeSummary[];
    unassignedParticipants: ParticipantSummary[];
};

const NO_JUDGE = 'none';

export default function PanelsIndex({
    panels,
    availableJudges,
    unassignedParticipants,
}: Props) {
    const [dialog, setDialog] = useState<
        | { mode: 'create' }
        | { mode: 'edit'; panel: Panel }
        | { mode: 'delete'; panel: Panel }
        | { mode: 'assign'; panel: Panel }
        | null
    >(null);

    const editing = dialog?.mode === 'edit' ? dialog.panel : null;

    const judgeOptions = (panel?: Panel | null) => {
        const options = [...availableJudges];

        if (panel?.judge) {
            options.unshift(panel.judge);
        }

        return options;
    };

    return (
        <>
            <Head title="Panel Juri" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="font-heading text-2xl font-bold text-foreground">
                            Panel Juri
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Setiap panel dipegang oleh tepat satu juri.
                            {unassignedParticipants.length > 0 && (
                                <>
                                    {' '}
                                    <span className="font-bold text-foreground numeric">
                                        {unassignedParticipants.length}
                                    </span>{' '}
                                    peserta belum ditugaskan ke panel.
                                </>
                            )}
                        </p>
                    </div>
                    <Button onClick={() => setDialog({ mode: 'create' })}>
                        <Plus className="size-4" />
                        Buat Panel
                    </Button>
                </div>

                {panels.length === 0 && (
                    <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center text-card-foreground text-muted-foreground">
                        Belum ada panel. Buat panel pertama untuk mulai membagi
                        peserta.
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {panels.map((panel) => (
                        <Card key={panel.id}>
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                                <div>
                                    <CardTitle className="font-heading text-lg">
                                        {panel.name}
                                    </CardTitle>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {panel.judge ? (
                                            <>Juri: {panel.judge.name}</>
                                        ) : (
                                            <span className="text-destructive">
                                                Belum ada juri
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8"
                                        onClick={() =>
                                            setDialog({
                                                mode: 'edit',
                                                panel,
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
                                                panel,
                                            })
                                        }
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Badge
                                        variant="outline"
                                        className="rounded-full"
                                    >
                                        <Users className="size-3" />
                                        <span className="numeric">
                                            {panel.participants?.length ?? 0}
                                        </span>{' '}
                                        peserta
                                    </Badge>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!panel.judge_id}
                                        onClick={() =>
                                            setDialog({
                                                mode: 'assign',
                                                panel,
                                            })
                                        }
                                    >
                                        <Plus className="size-3.5" />
                                        Tugaskan Peserta
                                    </Button>
                                </div>
                                <ul className="divide-y">
                                    {(panel.participants ?? []).map(
                                        (participant) => (
                                            <li
                                                key={participant.id}
                                                className="flex items-center justify-between py-2"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <ParticipantAvatar
                                                        name={participant.name}
                                                        className="size-7"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-bold">
                                                            {participant.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground numeric">
                                                            {
                                                                participant.participant_number
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-7 text-muted-foreground"
                                                    title="Keluarkan dari panel"
                                                    onClick={() =>
                                                        router.delete(
                                                            panelParticipants.destroy(
                                                                {
                                                                    panel: panel.id,
                                                                    participant:
                                                                        participant.id,
                                                                },
                                                            ).url,
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        )
                                                    }
                                                >
                                                    <UserMinus className="size-3.5" />
                                                </Button>
                                            </li>
                                        ),
                                    )}
                                    {(panel.participants ?? []).length ===
                                        0 && (
                                        <li className="py-3 text-center text-sm text-muted-foreground">
                                            Belum ada peserta.
                                        </li>
                                    )}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Create / Edit dialog */}
            <Dialog
                open={dialog?.mode === 'create' || dialog?.mode === 'edit'}
                onOpenChange={(open) => !open && setDialog(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? 'Edit Panel' : 'Buat Panel'}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Satu panel dipegang oleh tepat satu juri. Juri yang
                            sudah memegang panel lain tidak dapat dipilih.
                        </DialogDescription>
                    </DialogHeader>
                    <Form
                        {...(editing
                            ? panelRoutes.update.form(editing.id)
                            : panelRoutes.store.form())}
                        options={{ preserveScroll: true }}
                        onSuccess={() => setDialog(null)}
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="panel-name">
                                        Nama Panel
                                    </Label>
                                    <Input
                                        id="panel-name"
                                        name="name"
                                        defaultValue={editing?.name}
                                        placeholder="Panel Alpha"
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="panel-judge">Juri</Label>
                                    <Select
                                        name="judge_id"
                                        defaultValue={
                                            editing?.judge_id?.toString() ??
                                            NO_JUDGE
                                        }
                                    >
                                        <SelectTrigger id="panel-judge">
                                            <SelectValue placeholder="Pilih juri" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={NO_JUDGE}>
                                                Belum ditentukan
                                            </SelectItem>
                                            {judgeOptions(editing).map(
                                                (judge) => (
                                                    <SelectItem
                                                        key={judge.id}
                                                        value={judge.id.toString()}
                                                    >
                                                        {judge.name} (
                                                        {judge.email})
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.judge_id} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="panel-description">
                                        Deskripsi
                                    </Label>
                                    <Textarea
                                        id="panel-description"
                                        name="description"
                                        defaultValue={
                                            editing?.description ?? ''
                                        }
                                        placeholder="Deskripsi panel (opsional)"
                                        rows={2}
                                    />
                                    <InputError message={errors.description} />
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
                                        {editing ? 'Simpan' : 'Buat'}
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Assign participant dialog */}
            <Dialog
                open={dialog?.mode === 'assign'}
                onOpenChange={(open) => !open && setDialog(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tugaskan Peserta</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Pilih peserta yang akan ditugaskan ke panel{' '}
                            <strong>
                                {dialog?.mode === 'assign'
                                    ? dialog.panel.name
                                    : ''}
                            </strong>
                            .
                        </DialogDescription>
                    </DialogHeader>
                    {dialog?.mode === 'assign' && (
                        <Form
                            {...panelParticipants.store.form(dialog.panel.id)}
                            options={{ preserveScroll: true }}
                            onSuccess={() => setDialog(null)}
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="assign-participant">
                                            Peserta
                                        </Label>
                                        <Select name="participant_id" required>
                                            <SelectTrigger id="assign-participant">
                                                <SelectValue placeholder="Pilih peserta" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {unassignedParticipants.length ===
                                                    0 && (
                                                    <div className="px-3 py-2 text-sm text-muted-foreground">
                                                        Semua peserta sudah
                                                        memiliki panel.
                                                    </div>
                                                )}
                                                {unassignedParticipants.map(
                                                    (participant) => (
                                                        <SelectItem
                                                            key={participant.id}
                                                            value={participant.id.toString()}
                                                        >
                                                            {
                                                                participant.participant_number
                                                            }{' '}
                                                            — {participant.name}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={errors.participant_id}
                                        />
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
                                            Tugaskan
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete dialog */}
            <Dialog
                open={dialog?.mode === 'delete'}
                onOpenChange={(open) => !open && setDialog(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Hapus Panel</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Yakin ingin menghapus panel{' '}
                            <strong>
                                {dialog?.mode === 'delete'
                                    ? dialog.panel.name
                                    : ''}
                            </strong>
                            ? Peserta di panel ini menjadi tidak bertugas.
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
                                        panelRoutes.destroy(dialog.panel.id)
                                            .url,
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

PanelsIndex.layout = () => ({
    breadcrumbs: [
        {
            title: 'Panel',
            href: panelsIndex(),
        },
    ],
});
