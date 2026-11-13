import { useId, useRef, useState, type ReactNode } from 'react';

export interface NavbarLink {
  href: string;
  label: string;
  current?: boolean;
}

export interface NavbarProps {
  brand: ReactNode;
  homeHref?: string;
  label?: string;
  links: readonly NavbarLink[];
  actions?: ReactNode;
}

export function Navbar({ brand, homeHref = '/', label = 'Main', links, actions }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const toggle = useRef<HTMLButtonElement>(null);

  return (
    <nav
      className="uik-navbar"
      aria-label={label}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open && toggle.current?.getClientRects().length) {
          setOpen(false);
          toggle.current.focus();
        }
      }}
    >
      <a className="uik-brand" href={homeHref}>{brand}</a>
      <button
        ref={toggle}
        type="button"
        className="uik-button uik-menu-toggle"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(!open)}
      >
        Menu
      </button>
      <div id={menuId} className="uik-nav-content" data-open={open}>
        <ul className="uik-nav-links">
          {links.map(({ href, label: linkLabel, current }) => (
            <li key={href}>
              <a href={href} aria-current={current ? 'page' : undefined}>{linkLabel}</a>
            </li>
          ))}
        </ul>
        {actions && <div className="uik-nav-actions">{actions}</div>}
      </div>
    </nav>
  );
}
