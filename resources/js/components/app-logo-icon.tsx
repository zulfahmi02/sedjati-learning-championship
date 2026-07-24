import type { ImgHTMLAttributes } from 'react';

type AppLogoIconProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'>;

export default function AppLogoIcon({ alt = '', ...props }: AppLogoIconProps) {
    return <img src="/android-chrome-192x192.png" alt={alt} {...props} />;
}
