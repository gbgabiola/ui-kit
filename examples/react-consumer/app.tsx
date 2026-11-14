import * as React from 'react';
import { createRoot } from 'react-dom/client';
import {
  Checkbox, ContentCard, Hero, Navbar, Select, SiteFooter, Textarea,
  TextInput, ThemePaletteSelect, ThemeToggle, type Theme, type ThemePalette,
} from '@gbgabiola/ui';
import '@gbgabiola/ui/styles.css';
import './app.css';

interface Submission {
  service: string;
  updates: boolean;
}

function Playground() {
  const [theme, setTheme] = React.useState<Theme>('light');
  const [palette, setPalette] = React.useState<ThemePalette>('classic');
  const [submission, setSubmission] = React.useState<Submission | null>(null);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmission({ service: String(form.get('service')), updates: form.has('updates') });
  }

  return (
    <div id="top" className="uik-theme playground" data-theme={theme} data-palette={palette}>
      <Navbar
        brand="UI Kit playground"
        homeHref="#top"
        links={[{ href: '#appearance', label: 'Appearance' }, { href: '#contact', label: 'Sample form' }]}
        actions={<ThemeToggle theme={theme} onThemeChange={setTheme} />}
      />
      <main className="playground-main">
        <Hero
          title="Try the UI Kit"
          description="Choose a palette and fill out a sample project enquiry. The form stays on this page."
          actions={<a href="#contact">Try the form</a>}
        />
        <div className="playground-grid">
          <section id="appearance" aria-labelledby="appearance-title">
            <h2 id="appearance-title">Appearance</h2>
            <ThemePaletteSelect palette={palette} onPaletteChange={setPalette} />
            <ContentCard
              title="Reading nook"
              eyebrow="Sample project"
              description="A compact window seat with built-in storage."
              metadata="Furniture design"
              href="#contact"
            />
          </section>
          <section id="contact" aria-labelledby="contact-title">
            <h2 id="contact-title">Sample enquiry</h2>
            <form onSubmit={submit} onChange={() => setSubmission(null)}>
              <TextInput label="Email" name="email" type="email" autoComplete="email" required />
              <Select label="Service" name="service" defaultValue="" required>
                <option value="" disabled>Choose a service</option>
                <option>Design</option>
                <option>Installation</option>
              </Select>
              <Textarea label="Message" name="message" rows={4} hint="Tell us what you have in mind." required />
              <Checkbox label="Send me project updates" name="updates" />
              <button className="uik-button" type="submit">Submit sample enquiry</button>
            </form>
            <p role="status">
              {submission && `Sample enquiry for ${submission.service}. Updates ${submission.updates ? 'on' : 'off'}.`}
            </p>
          </section>
        </div>
      </main>
      <SiteFooter brand="UI Kit playground" linkGroups={[
        { label: 'Playground', links: [{ href: '#top', label: 'Back to top' }] },
      ]} />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<Playground />);
