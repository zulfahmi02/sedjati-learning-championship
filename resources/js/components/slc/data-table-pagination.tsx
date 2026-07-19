import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Paginated } from '@/types';

export function DataTablePagination({
    paginator,
}: {
    paginator: Paginated<unknown>;
}) {
    if (paginator.last_page <= 1) {
        return null;
    }

    return (
        <div className="flex items-center justify-between gap-4 border-t px-5 py-3">
            <p className="text-sm text-muted-foreground">
                Menampilkan{' '}
                <span className="numeric font-medium text-foreground">
                    {paginator.from ?? 0}–{paginator.to ?? 0}
                </span>{' '}
                dari{' '}
                <span className="numeric font-medium text-foreground">
                    {paginator.total}
                </span>{' '}
                data
            </p>
            <div className="flex items-center gap-1">
                {paginator.links.map((link, index) => {
                    const isPrev = index === 0;
                    const isNext = index === paginator.links.length - 1;

                    if (isPrev || isNext) {
                        return (
                            <Button
                                key={link.label}
                                variant="outline"
                                size="icon"
                                className="size-8"
                                disabled={!link.url}
                                asChild={Boolean(link.url)}
                            >
                                {link.url ? (
                                    <Link href={link.url} preserveScroll>
                                        {isPrev ? (
                                            <ChevronLeft className="size-4" />
                                        ) : (
                                            <ChevronRight className="size-4" />
                                        )}
                                    </Link>
                                ) : isPrev ? (
                                    <ChevronLeft className="size-4" />
                                ) : (
                                    <ChevronRight className="size-4" />
                                )}
                            </Button>
                        );
                    }

                    if (!link.url && link.label === '...') {
                        return (
                            <span
                                key={`${link.label}-${index}`}
                                className="px-1 text-sm text-muted-foreground"
                            >
                                …
                            </span>
                        );
                    }

                    return (
                        <Button
                            key={`${link.label}-${index}`}
                            variant={link.active ? 'default' : 'ghost'}
                            size="icon"
                            className="numeric size-8"
                            asChild={Boolean(link.url)}
                        >
                            {link.url ? (
                                <Link href={link.url} preserveScroll>
                                    {link.label}
                                </Link>
                            ) : (
                                <span>{link.label}</span>
                            )}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
