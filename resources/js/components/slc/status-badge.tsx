import { cn } from '@/lib/utils';

type Status =
    | 'registered'
    | 'scored'
    | 'draft'
    | 'submitted'
    | 'pending'
    | 'active'
    | 'locked'
    | 'published'
    | 'unpublished';

const statusConfig: Record<
    Status,
    { label: string; bg: string; text: string }
> = {
    registered: {
        label: 'Terdaftar',
        bg: 'bg-sun/30',
        text: 'text-foreground',
    },
    scored: {
        label: 'Dinilai',
        bg: 'bg-primary/15',
        text: 'text-primary',
    },
    draft: {
        label: 'Draf',
        bg: 'bg-secondary',
        text: 'text-secondary-foreground',
    },
    submitted: {
        label: 'Terkirim',
        bg: 'bg-primary/15',
        text: 'text-primary',
    },
    pending: {
        label: 'Menunggu',
        bg: 'bg-secondary',
        text: 'text-secondary-foreground',
    },
    active: {
        label: 'Berlangsung',
        bg: 'bg-primary',
        text: 'text-primary-foreground',
    },
    locked: {
        label: 'Terkunci',
        bg: 'bg-papaya/20',
        text: 'text-papaya',
    },
    published: {
        label: 'Dipublikasikan',
        bg: 'bg-primary',
        text: 'text-primary-foreground',
    },
    unpublished: {
        label: 'Belum Dipublikasikan',
        bg: 'bg-secondary',
        text: 'text-secondary-foreground',
    },
};

export function StatusBadge({
    status,
    label,
}: {
    status: Status;
    label?: string;
}) {
    const config = statusConfig[status];

    return (
        <span
            className={cn(
                'inline-block rounded-full px-3.5 py-1 font-heading text-xs font-bold shadow-sm',
                config.bg,
                config.text,
            )}
            style={{
                transform: `rotate(${status === 'active' || status === 'published' ? -2 : 1}deg)`,
            }}
        >
            {label ?? config.label}
        </span>
    );
}
