import type { HTMLAttributes } from 'react';

export default function AppLogoIcon({
    className = '',
    ...props
}: HTMLAttributes<HTMLSpanElement>) {
    return (
        <span
            className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-0.5 ${className}`}
            {...props}
        >
            <img
                src="/images/slc-logo-mark.png"
                alt=""
                aria-hidden="true"
                className="block size-full rounded-full object-cover"
            />
        </span>
    );
}
