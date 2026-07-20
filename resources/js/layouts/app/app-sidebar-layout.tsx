import { Blob } from '@/components/slc/blob';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <div className="relative min-h-screen bg-gradient-to-b from-butter to-[#FFFDF6]">
            <Blob className="-top-16 -right-24 size-60 bg-sun" />
            <Blob className="-bottom-16 -left-24 size-48 bg-papaya opacity-25" />
            <AppShell variant="sidebar">
                <AppSidebar />
                <AppContent variant="sidebar" className="relative overflow-x-hidden">
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    {children}
                </AppContent>
            </AppShell>
        </div>
    );
}
