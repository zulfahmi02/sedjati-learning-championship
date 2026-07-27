import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ClipboardPen,
    LayoutGrid,
    ListOrdered,
    Trophy,
    UserCog,
    Users,
    UsersRound,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import judges from '@/routes/admin/judges';
import monitoring from '@/routes/admin/monitoring';
import panels from '@/routes/admin/panels';
import participants from '@/routes/admin/participants';
import rounds from '@/routes/admin/rounds';
import { dashboard as judgeDashboard } from '@/routes/judge';
import liveScoring from '@/routes/judge/live-scoring';
import { index as leaderboard } from '@/routes/leaderboard';
import type { NavItem } from '@/types';

const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: adminDashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Peserta',
        href: participants.index(),
        icon: Users,
    },
    {
        title: 'Juri',
        href: judges.index(),
        icon: UserCog,
    },
    {
        title: 'Panel',
        href: panels.index(),
        icon: UsersRound,
    },
    {
        title: 'Ronde',
        href: rounds.index(),
        icon: ListOrdered,
    },
    {
        title: 'Monitoring',
        href: monitoring.index(),
        icon: Activity,
    },
    {
        title: 'Leaderboard',
        href: leaderboard(),
        icon: Trophy,
    },
];

const judgeNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: judgeDashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Penilaian',
        href: liveScoring.index(),
        icon: ClipboardPen,
    },
    {
        title: 'Leaderboard',
        href: leaderboard(),
        icon: Trophy,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const isAdmin = auth.user.role === 'admin';

    const mainNavItems = isAdmin ? adminNavItems : judgeNavItems;

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-r border-leaf/10"
        >
            <SidebarHeader className="border-b border-leaf/10 p-3 group-data-[collapsible=icon]:p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-28 flex-col justify-center gap-1 rounded-2xl group-data-[collapsible=icon]:gap-0 hover:bg-butter"
                        >
                            <Link href={dashboard()} prefetch>
                                <AppLogoIcon className="size-14 group-data-[collapsible=icon]:size-7" />
                                <span className="grid text-center leading-tight group-data-[collapsible=icon]:hidden">
                                    <span className="font-heading text-base font-bold text-deep dark:text-sidebar-foreground">
                                        SLC
                                    </span>
                                    <span className="text-[0.65rem] font-bold tracking-wider text-leaf uppercase">
                                        Scoring System
                                    </span>
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-leaf/10 p-3 group-data-[collapsible=icon]:p-2">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
