import { cn } from '@/lib/utils';

export function BrandWatermark({ className }: { className?: string }) {
    return (
        <img
            aria-hidden="true"
            alt=""
            src="/images/slc-logo-mark-removebg-preview.png"
            className={cn(
                'pointer-events-none absolute top-1/2 left-1/2 z-0 size-[min(70vw,42rem)] -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.035] select-none dark:opacity-[0.05]',
                className,
            )}
        />
    );
}
