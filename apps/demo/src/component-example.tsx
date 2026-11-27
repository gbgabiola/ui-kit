import * as React from 'react';
import { Button, Checkbox, ContentCard, Hero, Navbar, PricingTable, ProgressBar, Select, Sidebar, SiteFooter, Textarea, TextInput, ThemePaletteSelect, ThemeToggle } from '@gbgabiola/ui';
import { changeAppearance, useAppearance } from './appearance';

export function ComponentExample({ slug }: { slug: string }) {
  const appearance = useAppearance();
  const [count, setCount] = React.useState(0);
  const [text, setText] = React.useState('');
  const [selected, setSelected] = React.useState('personal');
  const [checked, setChecked] = React.useState(false);
  const [progress, setProgress] = React.useState(35);
  const [message, setMessage] = React.useState('');
  const status = <p role="status">{message}</p>;
  const wide = ['navbar', 'hero', 'sitefooter', 'pricingtable'].includes(slug);
  let content: React.ReactNode;
  switch (slug) {
    case 'button': content = <><div className="example-actions"><Button onClick={() => setCount(count + 1)}>Add item</Button><Button variant="secondary" onClick={() => setCount(0)}>Reset count</Button></div><p role="status">{count} {count === 1 ? 'item' : 'items'} added.</p></>; break;
    case 'textinput': content = <><TextInput label="Your name" hint="Try typing your name." value={text} onChange={(event) => setText(event.target.value)} /><p role="status">{text ? `Hello, ${text}.` : 'Your greeting will appear here.'}</p></>; break;
    case 'textarea': content = <><Textarea label="Message" value={text} onChange={(event) => setText(event.target.value)} /><p role="status">{text.length} characters</p></>; break;
    case 'select': content = <><Select label="Workspace" value={selected} onChange={(event) => setSelected(event.target.value)}><option value="personal">Personal</option><option value="team">Team</option></Select><p role="status">Selected workspace: {selected}</p></>; break;
    case 'checkbox': content = <><Checkbox label="Email updates" checked={checked} onChange={(event) => setChecked(event.target.checked)} /><p role="status">{checked ? 'Updates enabled.' : 'Updates disabled.'}</p></>; break;
    case 'themetoggle': content = <><ThemeToggle theme={appearance.theme} onThemeChange={(theme) => changeAppearance({ theme })} /><p role="status">Current theme: {appearance.theme}.</p></>; break;
    case 'themepaletteselect': content = <><ThemePaletteSelect palette={appearance.palette} onPaletteChange={(palette) => changeAppearance({ palette })} /><p role="status">Current palette: {appearance.palette}</p></>; break;
    case 'navbar': content = <><Navbar label="Example navigation" brand="Studio" homeHref="#example-overview" links={[{ href: '#example-overview', label: 'Overview' }, { href: '#example-projects', label: 'Projects' }]} /><h2 id="example-overview">Studio overview</h2><p id="example-projects">Browse the navigation with your keyboard or open its menu on a narrow screen.</p></>; break;
    case 'sidebar': content = <><Sidebar label="Project navigation" links={[{ href: '#example-projects', label: 'Projects', current: true }, { href: '#example-settings', label: 'Settings' }]} /><p id="example-projects">Your projects</p><p id="example-settings">Workspace settings</p></>; break;
    case 'progressbar': content = <><ProgressBar label="Upload progress" value={progress} /><label htmlFor="example-progress">Adjust progress</label><input id="example-progress" type="range" min="0" max="100" value={progress} onChange={(event) => setProgress(Number(event.target.value))} /><Button variant="secondary" onClick={() => setProgress(0)}>Reset progress</Button></>; break;
    case 'hero': content = <><Hero headingLevel={2} eyebrow="Design studio" title="Build a space that works for you" description="Furniture and interiors made for everyday use." actions={<Button onClick={() => setMessage('Projects opened.')}>View projects</Button>} />{status}</>; break;
    case 'sitefooter': content = <><p id="example-projects">Studio projects</p><p id="example-contact">Contact the studio</p><SiteFooter brand="Oak Studio" description="Furniture and interiors" linkGroups={[{ label: 'Explore', links: [{ label: 'Projects', href: '#example-projects' }] }, { label: 'Support', links: [{ label: 'Contact', href: '#example-contact' }] }]} bottom="© Oak Studio" /></>; break;
    case 'contentcard': content = <><ContentCard title="Reading nook" description="Built-in shelving for a small room." href="#project-details" actions={<Button aria-pressed={checked} onClick={() => setChecked(!checked)}>{checked ? 'Saved' : 'Save project'}</Button>} /><p id="project-details">Oak shelving and a quiet place to read.</p><p role="status">{checked ? 'Project saved.' : 'Project not saved.'}</p></>; break;
    case 'pricingtable': content = <><PricingTable title="Choose a plan" plans={['Basic', 'Pro', 'Studio'].map((name, index) => ({ id: name.toLowerCase(), name, price: ['$9', '$19', '$29'][index], period: '/ month', features: ['Project workspace', 'Email support'], highlight: index === 1 ? 'Popular' : undefined, action: <Button onClick={() => setMessage(`${name} selected.`)}>Choose {name}</Button> }))} />{status}</>; break;
    default: throw new Error(`Unknown component demo: ${slug}`);
  }
  return <main className="uik-theme component-preview" data-theme={appearance.theme} data-palette={appearance.palette} aria-label="Interactive component demo"><div className={`component-example${wide ? ' component-example-wide' : ''}`}>{content}</div></main>;
}
