import { ContentCard, Hero, Navbar, SiteFooter } from '@gbgabiola/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';

function StudioPage() {
  return (
    <div className="uik-theme" data-theme="dark" data-palette="walnut">
      <Navbar brand="Oak Studio" links={[
        { href: '#projects', label: 'Projects' },
        { href: '#contact', label: 'Contact' },
      ]} />
      <main>
        <Hero
          eyebrow="Furniture and interiors"
          title="Make room for what matters."
          description="Built-in furniture designed around the way you live."
          actions={<a href="#projects">Explore our work</a>}
          media={<div aria-hidden="true" style={{
            aspectRatio: '16 / 10',
            borderRadius: '0.5rem',
            background: 'linear-gradient(145deg, #624429, #a97a4b 52%, #46301e 52%)',
          }} />}
        />
        <section id="projects" aria-labelledby="projects-heading" style={{
          padding: 'clamp(1.5rem, 5vw, 4rem)', fontFamily: 'system-ui, sans-serif',
        }}>
          <h2 id="projects-heading">Selected projects</h2>
          <div style={{
            display: 'grid', gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 14rem), 1fr))',
          }}>
            <ContentCard title="Reading nook" description="Built-in shelves and a window seat." metadata="Oak" />
            <ContentCard title="Entry bench" description="A place for shoes, bags, and coats." metadata="Ash" />
          </div>
        </section>
      </main>
      <SiteFooter
        brand="Oak Studio"
        linkGroups={[
          { label: 'Explore', links: [{ href: '#projects', label: 'Projects' }] },
          { label: 'Contact', links: [{ href: 'mailto:studio@example.com', label: 'Email the studio' }] },
        ]}
        bottom={<span id="contact">© Oak Studio</span>}
      />
    </div>
  );
}

const meta = {
  title: 'Examples/Site Blocks',
  component: StudioPage,
  parameters: { layout: 'fullscreen' },
  tags: ['!autodocs'],
} satisfies Meta<typeof StudioPage>;

export default meta;
export const Studio: StoryObj<typeof meta> = {};
