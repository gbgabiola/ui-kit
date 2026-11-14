import { useId, useRef, useState } from 'react';

export interface SidebarLink {
  href: string;
  label: string;
  current?: boolean;
}

export interface SidebarProps {
  /** Names the navigation landmark and its toggle, for example "Account". */
  label: string;
  links: readonly SidebarLink[];
  defaultOpen?: boolean;
}

export function Sidebar({ label, links, defaultOpen = true }: SidebarProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const toggle = useRef<HTMLButtonElement>(null);

  return (
    <div className="uik-sidebar">
      <button
        ref={toggle}
        type="button"
        className="uik-button uik-sidebar-toggle"
        aria-controls={panelId}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {label}
      </button>
      <nav
        id={panelId}
        aria-label={label}
        hidden={!open}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && open && !event.defaultPrevented) {
            event.stopPropagation();
            setOpen(false);
            toggle.current?.focus();
          }
        }}
      >
        <ul className="uik-sidebar-links">
          {links.map(({ href, label: linkLabel, current }) => (
            <li key={href}>
              <a href={href} aria-current={current ? 'page' : undefined}>{linkLabel}</a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
