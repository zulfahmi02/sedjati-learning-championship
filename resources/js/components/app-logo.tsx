import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <AppLogoIcon className="size-9 rounded-xl object-contain shadow-sm" />
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate font-heading leading-tight font-bold text-deep">
                    SLC 2026
                </span>
            </div>
        </>
    );
}
