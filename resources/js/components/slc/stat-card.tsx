import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
    label: string;
    value: ReactNode;
    icon?: LucideIcon;
    detail?: ReactNode;
};

export function StatCard({ label, value, icon: Icon, detail }: Props) {
    return (
        <div className="group relative flex flex-col gap-3 overflow-hidden rounded-3xl border-2 border-border bg-card p-5 text-card-foreground shadow-[0_4px_0_rgba(42,51,31,0.06)] transition-transform duration-200 hover:-translate-y-0.5">
            <span
                aria-hidden
                className="absolute -top-8 -right-7 size-20 rounded-full bg-primary/12 transition-transform duration-300 group-hover:scale-110"
            />
            <div className="flex items-center justify-between">
                <span className="font-heading text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    {label}
                </span>
                {Icon && (
                    <span className="relative flex size-10 items-center justify-center rounded-2xl bg-secondary text-primary">
                        <Icon className="size-4" />
                    </span>
                )}
            </div>
            <div className="relative font-heading text-4xl font-extrabold text-card-foreground">
                {value}
            </div>
            {detail && (
                <div className="border-t border-border pt-2 text-xs font-semibold text-muted-foreground">
                    {detail}
                </div>
            )}
        </div>
    );
}
