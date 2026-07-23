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
        <div className="group relative flex flex-col gap-3 overflow-hidden rounded-3xl border-2 border-leaf/10 bg-white p-5 shadow-[0_4px_0_rgba(42,51,31,0.06)] transition-transform duration-200 hover:-translate-y-0.5 dark:bg-card">
            <span
                aria-hidden
                className="absolute -top-8 -right-7 size-20 rounded-full bg-sun/25 transition-transform duration-300 group-hover:scale-110"
            />
            <div className="flex items-center justify-between">
                <span className="font-heading text-xs font-bold tracking-wider text-ink/60 uppercase">
                    {label}
                </span>
                {Icon && (
                    <span className="relative flex size-9 items-center justify-center rounded-2xl bg-butter text-leaf">
                        <Icon className="size-4" />
                    </span>
                )}
            </div>
            <div className="relative font-heading text-4xl font-bold text-deep">
                {value}
            </div>
            {detail && (
                <div className="border-t border-leaf/10 pt-2 text-xs font-semibold text-ink/60">
                    {detail}
                </div>
            )}
        </div>
    );
}
