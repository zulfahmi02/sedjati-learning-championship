import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

type Props = {
    label: string;
    value: ReactNode;
    icon?: LucideIcon;
    detail?: ReactNode;
};

export function StatCard({ label, value, icon: Icon, detail }: Props) {
    return (
        <Card>
            <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        {label}
                    </span>
                    {Icon && <Icon className="size-4 text-primary" />}
                </div>
                <div className="numeric font-heading text-4xl font-bold text-foreground">
                    {value}
                </div>
                {detail && (
                    <div className="border-t pt-2 text-xs text-muted-foreground">
                        {detail}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
