import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Lupa kata sandi" />
            {status && (
                <div className="rounded-xl bg-leaf/10 px-4 py-3 text-center text-sm font-bold text-leaf">
                    {status}
                </div>
            )}
            <Form {...email.form()} className="grid gap-6">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label
                                htmlFor="email"
                                className="font-bold text-deep"
                            >
                                Alamat email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoFocus
                                autoComplete="email"
                                placeholder="email@contoh.com"
                            />
                            <InputError message={errors.email} />
                        </div>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full"
                        >
                            {processing && <Spinner />}
                            Kirim tautan reset
                        </Button>
                    </>
                )}
            </Form>
            <Link
                href={login()}
                className="block text-center text-sm font-bold text-leaf hover:underline"
            >
                Kembali ke halaman masuk
            </Link>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Lupa kata sandi?',
    description: 'Masukkan email akun untuk menerima tautan reset kata sandi.',
};
