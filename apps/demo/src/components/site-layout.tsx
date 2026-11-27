import type { ReactNode } from 'react';
import { Navbar, SiteFooter, ThemeToggle } from '@gbgabiola/ui';
import { changeAppearance, useAppearance } from '../theme/appearance';
import { base, storybook } from '../catalog/links';

export function SiteLayout({ children }: { children: ReactNode }) {
  const appearance = useAppearance();
  return <div className="uik-theme gallery" data-theme={appearance.theme} data-palette={appearance.palette}>
    <a className="skip-link" href="#main">Skip to content</a>
    <Navbar brand="UI Kit" homeHref={base} links={[{ href: `${base}#demos`, label: 'Demos' }, { href: storybook, label: 'Storybook' }, { href: 'https://github.com/gbgabiola/ui-kit', label: 'GitHub' }]}
      actions={<ThemeToggle theme={appearance.theme} onThemeChange={(theme) => changeAppearance({ theme })} />} />
    <main id="main" className="gallery-main">{children}</main>
      <SiteFooter brand="UI Kit" description="Reusable components and frontend experiments by Genesis Gabiola."
        linkGroups={[{ label: 'Explore', links: [{ href: `${base}#demos`, label: 'Demos' }, { href: storybook, label: 'Component documentation' }] },
          { label: 'Elsewhere', links: [{ href: 'https://github.com/gbgabiola/ui-kit', label: 'Source code' }, { href: 'https://gbgabiola.vercel.app/', label: 'Portfolio' }] }]}
        bottom={        <div className="gallery-footer-inner">
          <p>© 2018–{new Date().getUTCFullYear()}{' '}
            <a className="gallery-footer-brand" href="https://gbgabiola.vercel.app/">gbgabiola</a>
          </p>
          <nav aria-label="Footer" className="gallery-footer-links">
            <a href="https://github.com/gbgabiola">GitHub <span aria-hidden="true">↗</span></a>
            <a href="https://gbgabiola.vercel.app/blog">Articles</a>
            <a href="https://gbgabiola.vercel.app/contact">Get in touch</a>
          </nav>
        </div>} />
  </div>;
}
