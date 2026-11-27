import { technologies } from '../catalog';

type Props = {
  categories: string[];
  technology: string;
  category: string;
  setTechnology: (value: string) => void;
  setCategory: (value: string) => void;
};
export function DemoFilters({ categories, technology, category, setTechnology, setCategory }: Props) {
  return <>        <div className="filters" role="group" aria-label="Filter demos by technology">{technologies.map((item) => <button key={item.value} type="button" aria-pressed={item.value === technology} onClick={() => setTechnology(item.value)}>{item.label}</button>)}</div>
        <div className="filters" role="group" aria-label="Filter demos by category">{categories.map((item) => <button key={item} type="button" aria-pressed={item === category} onClick={() => setCategory(item)}>{item}</button>)}</div>
  </>;
}
