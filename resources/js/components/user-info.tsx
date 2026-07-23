import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();
    const showAvatar = Boolean(user.avatar && user.avatar !== '');

    return (
        <>
            <Avatar className="h-9 w-9 overflow-hidden rounded-xl border-2 border-leaf/15">
                {showAvatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                ) : null}
                <AvatarFallback className="rounded-xl bg-butter font-heading font-bold text-deep">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-heading font-bold text-deep">
                    {user.name}
                </span>
                {showEmail ? (
                    <span className="truncate text-xs font-semibold text-ink/55">
                        {user.email}
                    </span>
                ) : null}
            </div>
        </>
    );
}
