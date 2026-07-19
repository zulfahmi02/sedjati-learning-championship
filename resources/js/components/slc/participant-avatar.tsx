import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';

export function ParticipantAvatar({
    name,
    className,
}: {
    name: string;
    className?: string;
}) {
    const getInitials = useInitials();

    return (
        <Avatar className={cn('size-9', className)}>
            <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
                {getInitials(name)}
            </AvatarFallback>
        </Avatar>
    );
}
