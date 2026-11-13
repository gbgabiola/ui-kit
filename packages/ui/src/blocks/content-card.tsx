import type { ReactNode } from 'react';

export interface ContentCardProps {
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  media?: ReactNode;
  metadata?: ReactNode;
  href?: string;
  actions?: ReactNode;
  headingLevel?: 2 | 3 | 4;
}

export function ContentCard({
  title, eyebrow, description, media, metadata, href, actions, headingLevel = 3,
}: ContentCardProps) {
  const Heading = headingLevel === 2 ? 'h2' : headingLevel === 4 ? 'h4' : 'h3';

  return (
    <article className="uik-content-card">
      {media != null && typeof media !== 'boolean' && <div className="uik-block-media">{media}</div>}
      <div className="uik-card-copy">
        {eyebrow && <p className="uik-block-eyebrow">{eyebrow}</p>}
        <Heading>{href !== undefined ? <a href={href}>{title}</a> : title}</Heading>
        {description != null && <div className="uik-block-description">{description}</div>}
        {metadata != null && <div className="uik-card-metadata">{metadata}</div>}
        {actions != null && <div className="uik-block-actions">{actions}</div>}
      </div>
    </article>
  );
}
