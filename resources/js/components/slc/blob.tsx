export function Blob({ className }: { className?: string }) {
    return (
        <div
            aria-hidden
            className={`blob ${className ?? ''}`}
        />
    );
}
