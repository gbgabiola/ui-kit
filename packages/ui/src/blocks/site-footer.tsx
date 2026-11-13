import type { ReactNode } from 'react';

export interface SiteFooterLink {
  label: string;
  href: string;
}

export interface SiteFooterLinkGroup {
  label: string;
  links: readonly SiteFooterLink[];
}

export interface SiteFooterProps {
  brand?: ReactNode;
  description?: ReactNode;
  linkGroups?: readonly SiteFooterLinkGroup[];
  bottom?: ReactNode;
}

export function SiteFooter({ brand, description, linkGroups = [], bottom }: SiteFooterProps) {
  return (
    <footer className="uik-site-footer">
      {(brand != null || description != null) && (
        <div className="uik-footer-intro">
          {brand != null && <div className="uik-footer-brand">{brand}</div>}
          {description != null && <div className="uik-block-description">{description}</div>}
        </div>
      )}
      {linkGroups.length > 0 && (
        <div className="uik-footer-groups">
          {linkGroups.map(({ label, links }) => (
            <nav key={label} aria-label={label}>
              <p className="uik-footer-group-label">{label}</p>
              <ul>
                {links.map(({ href, label: linkLabel }) => (
                  <li key={href}><a href={href}>{linkLabel}</a></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      )}
      {bottom != null && <div className="uik-footer-bottom">{bottom}</div>}
    </footer>
  );
}
