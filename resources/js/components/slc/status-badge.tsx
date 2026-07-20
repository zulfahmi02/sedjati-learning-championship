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

const statusConfig: Record<Status, { label: string; bg: string; text: string }> = {
    registered: {
        label: 'Terdaftar',
        bg: 'bg-sun/30',
        text: 'text-deep',
    },
    scored: {
        label: 'Dinilai',
        bg: 'bg-leaf/20',
        text: 'text-leaf',
    },
    draft: {
        label: 'Draf',
        bg: 'bg-butter',
        text: 'text-ink/60',
    },
    submitted: {
        label: 'Terkirim',
        bg: 'bg-leaf/20',
        text: 'text-leaf',
    },
    pending: {
        label: 'Menunggu',
        bg: 'bg-butter',
        text: 'text-ink/60',
    },
    active: {
        label: 'Berlangsung',
        bg: 'bg-leaf',
        text: 'text-white',
    },
    locked: {
        label: 'Terkunci',
        bg: 'bg-papaya/20',
        text: 'text-papaya',
    },
    published: {
        label: 'Dipublikasikan',
        bg: 'bg-leaf',
        text: 'text-white',
    },
    unpublished: {
        label: 'Belum Dipublikasikan',
        bg: 'bg-butter',
        text: 'text-ink/60',
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
            style={{ transform: `rotate(${status === 'active' || status === 'published' ? -2 : 1}deg)` }}
        >
            {label ?? config.label}
        </span>
    );
}
