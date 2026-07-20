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
        <div className="flex flex-col gap-3 rounded-2xl border-2 border-leaf/10 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <span className="font-heading text-xs font-bold tracking-wider text-ink/60 uppercase">
                    {label}
                </span>
                {Icon && <Icon className="size-4 text-leaf" />}
            </div>
            <div className="font-heading text-4xl font-bold text-deep">
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
