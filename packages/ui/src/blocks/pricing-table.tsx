import { useId, type ReactNode } from 'react';

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period?: string;
  description?: ReactNode;
  features?: readonly string[];
  highlight?: string;
  action?: ReactNode;
}

export interface PricingTableProps {
  title: string;
  description?: ReactNode;
  plans: readonly PricingPlan[];
  headingLevel?: 1 | 2 | 3;
}

export function PricingTable({ title, description, plans, headingLevel = 2 }: PricingTableProps) {
  const headingId = useId();
  const Heading = `h${headingLevel}` as const;
  const PlanHeading = headingLevel === 1 ? 'h2' : headingLevel === 2 ? 'h3' : 'h4';

  return (
    <section className="uik-pricing" aria-labelledby={headingId}>
      <header className="uik-pricing-header">
        <Heading id={headingId}>{title}</Heading>
        {description != null && <div className="uik-block-description">{description}</div>}
      </header>
      <div className="uik-pricing-grid">
        {plans.map(({ id, name, price, period, description: summary, features, highlight, action }) => (
          <article key={id} className="uik-pricing-plan" data-highlighted={Boolean(highlight)}>
            {highlight && <p className="uik-block-eyebrow">{highlight}</p>}
            <PlanHeading>{name}</PlanHeading>
            <p className="uik-pricing-cost">
              <strong>{price}</strong>{period && <span> {period}</span>}
            </p>
            {summary != null && <div className="uik-block-description">{summary}</div>}
            {!!features?.length && (
              <ul className="uik-pricing-features">
                {features.map((feature, index) => <li key={index}>{feature}</li>)}
              </ul>
            )}
            {action != null && <div className="uik-pricing-action">{action}</div>}
          </article>
        ))}
      </div>
    </section>
  );
}
