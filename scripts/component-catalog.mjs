import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../apps/demo/package.json', import.meta.url));
const ts = require('typescript');
const storyRequire = createRequire(new URL('../apps/storybook/package.json', import.meta.url));
const { toId, storyNameFromExport } = storyRequire('storybook/internal/csf');
const portable = (path) => path.split(sep).join('/');
const unwrap = (node) => {
  while (node && (ts.isSatisfiesExpression(node) || ts.isAsExpression(node) || ts.isParenthesizedExpression(node))) node = node.expression;
  return node;
};
async function parse(file) {
  const source = ts.createSourceFile(file, await readFile(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  assert.equal(source.parseDiagnostics.length, 0, `Invalid TypeScript in ${file}`);
  return source;
}
function property(object, name) {
  return object?.properties?.find((entry) => ts.isPropertyAssignment(entry) && entry.name.getText().replace(/["']/g, '') === name)?.initializer;
}
function literal(node, label) {
  node = unwrap(node);
  assert.ok(node && (ts.isStringLiteralLike(node) || ts.isNumericLiteral(node) || [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword].includes(node.kind)), `${label} must be a literal`);
  return ts.isStringLiteralLike(node) ? node.text : ts.isNumericLiteral(node) ? Number(node.text) : node.kind === ts.SyntaxKind.TrueKeyword;
}
function declaration(source, name) {
  for (const statement of source.statements) if (ts.isVariableStatement(statement)) {
    for (const entry of statement.declarationList.declarations) if (entry.name.getText(source) === name) return unwrap(entry.initializer);
  }
}
const exported = (node) => node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
export async function publicComponents(root) {
  const index = resolve(root, 'packages/ui/src/index.ts');
  const source = await parse(index);
  const components = [];
  for (const entry of source.statements) {
    if (!ts.isExportDeclaration(entry) || entry.isTypeOnly || !entry.moduleSpecifier || !entry.exportClause || !ts.isNamedExports(entry.exportClause)) continue;
    for (const name of entry.exportClause.elements) {
      if (name.isTypeOnly || !/^[A-Z]/.test(name.name.text)) continue;
      const file = resolve(root, 'packages/ui/src', entry.moduleSpecifier.text.replace(/\.js$/, '.tsx'));
      assert.ok((await stat(file)).isFile(), `Missing source for ${name.name.text}`);
      components.push({ name: name.name.text, source: portable(relative(root, file)) });
    }
  }
  assert.equal(new Set(components.map((item) => item.name)).size, components.length, 'Duplicate public component exports');
  return components;
}
async function componentStories(root) {
  const folder = resolve(root, 'apps/storybook/stories');
  const stories = new Map();
  for (const filename of (await readdir(folder)).filter((name) => name.endsWith('.stories.tsx')).sort()) {
    const source = await parse(resolve(folder, filename));
    const meta = declaration(source, 'meta');
    const component = property(meta, 'component');
    if (!component || !ts.isIdentifier(component)) continue;
    let componentName;
    for (const entry of source.statements) if (ts.isImportDeclaration(entry) && entry.moduleSpecifier.text === '@gbgabiola/ui') {
      const bindings = entry.importClause?.namedBindings;
      if (bindings && ts.isNamedImports(bindings)) componentName = bindings.elements.find((name) => name.name.text === component.text)?.propertyName?.text ?? bindings.elements.find((name) => name.name.text === component.text)?.name.text;
    }
    if (!componentName) continue;
    const title = literal(property(meta, 'title'), `${filename} title`);
    const id = property(meta, 'id') ? literal(property(meta, 'id'), `${filename} id`) : toId(title);
    let first;
    for (const entry of source.statements) {
      if (exported(entry) && ts.isVariableStatement(entry)) {
        first = entry.declarationList.declarations.find((item) => ts.isIdentifier(item.name) && /^[A-Z]/.test(item.name.text))?.name.text;
      } else if (exported(entry) && ts.isFunctionDeclaration(entry) && entry.name && /^[A-Z]/.test(entry.name.text)) first = entry.name.text;
      if (first) break;
    }
    assert.ok(first, `Add an exported story for ${componentName}`);
    assert.ok(!stories.has(componentName), `Multiple component story files for ${componentName}`);
    stories.set(componentName, { story: toId(id, storyNameFromExport(first)), docs: `${id}--docs` });
  }
  return stories;
}
export async function componentCatalog(root) {
  const components = await publicComponents(root);
  const stories = await componentStories(root);
  const byName = new Map(components.map((item) => [item.name, item]));
  const folder = resolve(root, 'apps/demo/src/examples');
  const entries = [];
  for (const filename of (await readdir(folder)).filter((name) => name.endsWith('.tsx')).sort()) {
    const source = await parse(resolve(folder, filename));
    const meta = declaration(source, 'meta');
    assert.ok(meta && ts.isObjectLiteralExpression(meta), `Export literal demo metadata in ${filename}`);
    const name = literal(property(meta, 'component'), `${filename} component`);
    assert.ok(byName.has(name), `${name} demo has no public component export`);
    const example = source.statements.some((entry) => exported(entry) && ts.isFunctionDeclaration(entry) && entry.name?.text === 'Example');
    assert.ok(example, `Export an Example function in ${filename}`);
    assert.ok(stories.has(name), `Add a Storybook story with component: ${name}`);
    const category = literal(property(meta, 'category'), `${filename} category`);
    const description = literal(property(meta, 'description'), `${filename} description`);
    assert.ok(typeof category === 'string' && category.trim() && typeof description === 'string' && description.trim());
    const order = property(meta, 'order') ? literal(property(meta, 'order'), `${filename} order`) : Number.MAX_SAFE_INTEGER;
    assert.ok(typeof order === 'number' && Number.isFinite(order));
    const slug = name.toLowerCase();
    entries.push({ order, slug, title: name, category, description, ...stories.get(name), previews: { light: `previews/components/${slug}-light.png`, dark: `previews/components/${slug}-dark.png` }, source: byName.get(name).source });
  }
  assert.equal(new Set(entries.map((item) => item.slug)).size, entries.length, 'Duplicate component demo slugs');
  const missing = components.filter((item) => !entries.some((demo) => demo.title === item.name));
  assert.equal(missing.length, 0, `Add a demo entry for: ${missing.map((item) => item.name).join(', ')}. Use pnpm component:add for new components.`);
  return entries.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)).map(({ order, ...item }) => item);
}
