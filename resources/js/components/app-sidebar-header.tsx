import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-leaf/10 bg-white/75 px-4 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14 md:px-6 dark:bg-card/80">
            <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger className="-ml-1 border-leaf/10 bg-butter/70 text-deep hover:bg-butter" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="ml-auto hidden items-center gap-2 text-xs font-bold tracking-wider text-leaf uppercase sm:flex">
                <span className="size-2 animate-pulse rounded-full bg-papaya" />
                SLC 2026
            </div>
        </header>
    );
}
