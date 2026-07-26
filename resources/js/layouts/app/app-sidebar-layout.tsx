import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { Blob } from '@/components/slc/blob';
import { BrandWatermark } from '@/components/slc/brand-watermark';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <div className="relative min-h-screen overflow-x-clip bg-gradient-to-b from-butter to-[#FFFDF6] dark:from-deep dark:to-background">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden"
            >
                <Blob className="-top-16 -right-24 size-60 bg-sun" />
                <Blob className="-bottom-16 -left-24 size-48 bg-papaya opacity-25" />
            </div>
            <AppShell variant="sidebar">
                <AppSidebar />
                <AppContent
                    variant="sidebar"
                    className="relative overflow-x-clip bg-transparent"
                >
                    <BrandWatermark />
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    <div className="relative z-10">{children}</div>
                </AppContent>
            </AppShell>
        </div>
    );
}
