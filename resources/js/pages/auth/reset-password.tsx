import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { update } from '@/routes/password';

type Props = { email: string; token: string };

export default function ResetPassword({ email, token }: Props) {
    return (
        <>
            <Head title="Atur ulang kata sandi" />
            <Form
                {...update.form()}
                className="grid gap-5"
                resetOnSuccess={['password', 'password_confirmation']}
            >
                {({ processing, errors }) => (
                    <>
                        <input type="hidden" name="token" value={token} />
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
                                value={email}
                                readOnly
                            />
                            <InputError message={errors.email} />
                        </div>
                        <div className="grid gap-2">
                            <Label
                                htmlFor="password"
                                className="font-bold text-deep"
                            >
                                Kata sandi baru
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                autoFocus
                                autoComplete="new-password"
                            />
                            <InputError message={errors.password} />
                        </div>
                        <div className="grid gap-2">
                            <Label
                                htmlFor="password_confirmation"
                                className="font-bold text-deep"
                            >
                                Konfirmasi kata sandi
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                required
                                autoComplete="new-password"
                            />
                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full"
                        >
                            {processing && <Spinner />}
                            Simpan kata sandi baru
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

ResetPassword.layout = {
    title: 'Atur ulang kata sandi',
    description:
        'Gunakan kata sandi kuat yang belum pernah digunakan sebelumnya.',
};
