import { Badge } from '@/components/ui/badge';
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

const statusConfig: Record<Status, { label: string; className: string }> = {
    registered: {
        label: 'Terdaftar',
        className:
            'bg-gold-muted text-gold border-transparent dark:bg-gold-muted dark:text-gold',
    },
    scored: {
        label: 'Dinilai',
        className: 'bg-accent text-accent-foreground border-transparent',
    },
    draft: {
        label: 'Draf',
        className: 'bg-muted text-muted-foreground border-transparent',
    },
    submitted: {
        label: 'Terkirim',
        className: 'bg-accent text-accent-foreground border-transparent',
    },
    pending: {
        label: 'Menunggu',
        className: 'bg-muted text-muted-foreground border-transparent',
    },
    active: {
        label: 'Berlangsung',
        className: 'bg-primary text-primary-foreground border-transparent',
    },
    locked: {
        label: 'Terkunci',
        className:
            'bg-destructive/10 text-destructive border-transparent dark:bg-destructive/20',
    },
    published: {
        label: 'Dipublikasikan',
        className: 'bg-primary text-primary-foreground border-transparent',
    },
    unpublished: {
        label: 'Belum Dipublikasikan',
        className: 'bg-muted text-muted-foreground border-transparent',
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
        <Badge
            variant="outline"
            className={cn('rounded-full px-3', config.className)}
        >
            {label ?? config.label}
        </Badge>
    );
}
