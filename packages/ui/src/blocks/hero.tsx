import { useId, type ReactNode } from 'react';

export interface HeroProps {
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  actions?: ReactNode;
  media?: ReactNode;
  headingLevel?: 1 | 2;
}

export function Hero({ title, eyebrow, description, actions, media, headingLevel = 1 }: HeroProps) {
  const headingId = useId();
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  const hasMedia = media != null && typeof media !== 'boolean';

  return (
    <section className="uik-hero" data-layout={hasMedia ? 'split' : 'text'} aria-labelledby={headingId}>
      <div className="uik-hero-copy">
        {eyebrow && <p className="uik-block-eyebrow">{eyebrow}</p>}
        <Heading id={headingId}>{title}</Heading>
        {description != null && <div className="uik-block-description">{description}</div>}
        {actions != null && <div className="uik-block-actions">{actions}</div>}
      </div>
      {hasMedia && <div className="uik-block-media">{media}</div>}
    </section>
  );
}
