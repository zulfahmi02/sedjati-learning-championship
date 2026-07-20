export default function Heading({
    title,
    description,
    variant = 'default',
}: {
    title: string;
    description?: string;
    variant?: 'default' | 'small';
}) {
    return (
        <header className={variant === 'small' ? '' : 'mb-8 space-y-0.5'}>
            <h2
                className={
                    variant === 'small'
                        ? 'mb-0.5 font-heading text-base font-bold text-deep'
                        : 'font-heading text-2xl font-bold text-deep'
                }
            >
                {title}
            </h2>
            {description && (
                <p className="text-sm font-semibold text-ink/70">{description}</p>
            )}
        </header>
    );
}
