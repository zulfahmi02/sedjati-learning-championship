import { Form, Head, router } from '@inertiajs/react';
import { KeyRound, Pencil, Search, UserPlus } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
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
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import judgeRoutes, { password as judgePassword } from '@/routes/admin/judges';
import { index as judgesIndex } from '@/routes/admin/judges';
import type { Paginated, User } from '@/types';

type Judge = User & {
    panel: { id: number; name: string } | null;
};

type Props = {
    judges: Paginated<Judge>;
    filters: {
        search: string;
    };
};

export default function JudgesIndex({ judges, filters }: Props) {
    const [dialog, setDialog] = useState<
        | { mode: 'create' }
        | { mode: 'edit'; judge: Judge }
        | { mode: 'reset'; judge: Judge }
        | null
    >(null);

    const [search, setSearch] = useState(filters.search);
    const [editActive, setEditActive] = useState(true);

    const applySearch = () => {
        router.get(
            judgesIndex().url,
            { search: search || undefined },
            { preserveState: true, preserveScroll: true },
        );
    };

    const editing = dialog?.mode === 'edit' ? dialog.judge : null;
    const resetting = dialog?.mode === 'reset' ? dialog.judge : null;

    return (
        <>
            <Head title="Manajemen Juri" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="font-heading text-2xl font-semibold">
                            Manajemen Juri
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola akun juri, status aktif, dan reset kata
                            sandi.
                        </p>
                    </div>
                    <Button onClick={() => setDialog({ mode: 'create' })}>
                        <UserPlus className="size-4" />
                        Tambah Juri
                    </Button>
                </div>

                <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && applySearch()
                            }
                            onBlur={() =>
                                search !== filters.search && applySearch()
                            }
                            placeholder="Cari nama atau email juri..."
                            className="pl-9"
                        />
                    </div>
                </div>

                <div className="rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Panel</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-28 text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {judges.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        Belum ada juri.
                                    </TableCell>
                                </TableRow>
                            )}
                            {judges.data.map((judge) => (
                                <TableRow key={judge.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <ParticipantAvatar
                                                name={judge.name}
                                            />
                                            <span className="font-medium">
                                                {judge.name}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {judge.email}
                                    </TableCell>
                                    <TableCell>
                                        {judge.panel?.name ?? (
                                            <span className="text-muted-foreground italic">
                                                Belum ada panel
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge
                                            status={
                                                judge.is_active
                                                    ? 'active'
                                                    : 'locked'
                                            }
                                            label={
                                                judge.is_active
                                                    ? 'Aktif'
                                                    : 'Nonaktif'
                                            }
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8"
                                                title="Edit juri"
                                                onClick={() => {
                                                    setEditActive(
                                                        judge.is_active,
                                                    );
                                                    setDialog({
                                                        mode: 'edit',
                                                        judge,
                                                    });
                                                }}
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8"
                                                title="Reset kata sandi"
                                                onClick={() =>
                                                    setDialog({
                                                        mode: 'reset',
                                                        judge,
                                                    })
                                                }
                                            >
                                                <KeyRound className="size-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <DataTablePagination paginator={judges} />
                </div>
            </div>

            {/* Create dialog */}
            <Dialog
                open={dialog?.mode === 'create'}
                onOpenChange={(open) => !open && setDialog(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tambah Juri</DialogTitle>
                        <DialogDescription>
                            Buat akun juri baru. Sampaikan email dan kata sandi
                            kepada juri secara langsung.
                        </DialogDescription>
                    </DialogHeader>
                    <Form
                        {...judgeRoutes.store.form()}
                        options={{ preserveScroll: true }}
                        onSuccess={() => setDialog(null)}
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="judge-name">Nama</Label>
                                    <Input
                                        id="judge-name"
                                        name="name"
                                        placeholder="Nama lengkap"
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="judge-email">Email</Label>
                                    <Input
                                        id="judge-email"
                                        name="email"
                                        type="email"
                                        placeholder="juri@contoh.com"
                                        required
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="judge-password">
                                        Kata Sandi
                                    </Label>
                                    <PasswordInput
                                        id="judge-password"
                                        name="password"
                                        placeholder="Kata sandi"
                                        required
                                    />
                                    <InputError message={errors.password} />
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
                                        Tambah
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Edit dialog */}
            <Dialog
                open={dialog?.mode === 'edit'}
                onOpenChange={(open) => !open && setDialog(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Juri</DialogTitle>
                        <DialogDescription>
                            Perbarui data juri atau nonaktifkan akunnya.
                        </DialogDescription>
                    </DialogHeader>
                    {editing && (
                        <Form
                            {...judgeRoutes.update.form(editing.id)}
                            options={{ preserveScroll: true }}
                            transform={(data) => ({
                                ...data,
                                is_active: editActive,
                            })}
                            onSuccess={() => setDialog(null)}
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-judge-name">
                                            Nama
                                        </Label>
                                        <Input
                                            id="edit-judge-name"
                                            name="name"
                                            defaultValue={editing.name}
                                            required
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-judge-email">
                                            Email
                                        </Label>
                                        <Input
                                            id="edit-judge-email"
                                            name="email"
                                            type="email"
                                            defaultValue={editing.email}
                                            required
                                        />
                                        <InputError message={errors.email} />
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-3">
                                        <div>
                                            <p className="text-sm font-medium">
                                                Akun Aktif
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Juri nonaktif tidak dapat
                                                masuk ke sistem.
                                            </p>
                                        </div>
                                        <Switch
                                            checked={editActive}
                                            onCheckedChange={setEditActive}
                                        />
                                    </div>
                                    <InputError message={errors.is_active} />
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
                                            Simpan
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Reset password dialog */}
            <Dialog
                open={dialog?.mode === 'reset'}
                onOpenChange={(open) => !open && setDialog(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reset Kata Sandi</DialogTitle>
                        <DialogDescription>
                            Tetapkan kata sandi baru untuk{' '}
                            <strong>{resetting?.name}</strong>. Sampaikan kata
                            sandi baru kepada juri secara langsung.
                        </DialogDescription>
                    </DialogHeader>
                    {resetting && (
                        <Form
                            {...judgePassword.form(resetting.id)}
                            options={{ preserveScroll: true }}
                            onSuccess={() => setDialog(null)}
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="reset-password">
                                            Kata Sandi Baru
                                        </Label>
                                        <PasswordInput
                                            id="reset-password"
                                            name="password"
                                            placeholder="Kata sandi baru"
                                            required
                                        />
                                        <InputError
                                            message={errors.password}
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
                                            Reset
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

JudgesIndex.layout = () => ({
    breadcrumbs: [
        {
            title: 'Juri',
            href: judgesIndex(),
        },
    ],
});
