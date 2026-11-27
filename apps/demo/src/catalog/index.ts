import standalone from '../../../../demos/catalog.json' with { type: 'json' };
import components from '../../../../demos/components.json' with { type: 'json' };
export const libraryDemos = components.map((item) => ({ ...item, kind: 'react' as const, implementation: 'react', sourceHref: `https://github.com/gbgabiola/ui-kit/blob/main/${item.source}` }));
export const allDemos = [
  ...standalone.map((item) => ({ ...item, kind: 'native' as const, docs: undefined, sourceHref: `https://github.com/gbgabiola/ui-kit/tree/main/demos/native/${item.slug}` })),
  ...libraryDemos,
];
export const technologies = [{ value: 'all', label: 'All' }, { value: 'html-css', label: 'HTML/CSS' }, { value: 'html-css-js', label: 'HTML/CSS/JavaScript' }, { value: 'react', label: 'React' }];

export type Demo = (typeof allDemos)[number];
