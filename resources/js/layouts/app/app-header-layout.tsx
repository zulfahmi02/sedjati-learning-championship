import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import { BrandWatermark } from '@/components/slc/brand-watermark';
import type { AppLayoutProps } from '@/types';

export default function AppHeaderLayout({
    children,
    breadcrumbs,
}: AppLayoutProps) {
    return (
        <div className="relative min-h-screen">
            <BrandWatermark />
            <div className="relative z-10">
                <AppShell variant="header">
                    <AppHeader breadcrumbs={breadcrumbs} />
                    <AppContent variant="header">{children}</AppContent>
                </AppShell>
            </div>
        </div>
    );
}
