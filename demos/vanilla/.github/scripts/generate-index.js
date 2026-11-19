const fs = require('fs');
const path = require('path');

console.log('🚀 [START] Initiating Sandbox Workspace Auto-Generation Pipeline...');
console.log('------------------------------------------------====================');

const rootDir = path.join(__dirname, '../../');
const items = fs.readdirSync(rootDir);

const exclude = ['.git', '.github', 'node_modules', 'img', 'favicons', '.vscode', '.vcode'];

const projects = items
  .filter(item => {
    const fullPath = path.join(rootDir, item);
    return fs.statSync(fullPath).isDirectory() && !exclude.includes(item);
  })
  .map(folder => {
    const folderPath = path.join(rootDir, folder);
    const jsonPath = path.join(folderPath, 'project.json');
    let displayName = folder;

    const folderContents = fs.readdirSync(folderPath);
    const hasJs = folderContents.some(file => file.endsWith('.js') && file !== 'project.json');

    if (fs.existsSync(jsonPath)) {
      try {
        const meta = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        if (meta.title) displayName = meta.title;
      } catch (e) {
        console.warn(`⚠️  [WARN] Failed to parse json metadata in folder: ${folder}`);
      }
    } else {
      displayName = folder
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      if (displayName.toLowerCase() === 'ghibli api') displayName = 'Ghibli API';
    }

    const stackIcon = hasJs ? '⚡ [Interactive]' : '🎨 [Presentational]';
    console.log(`📁 Found Component: /${folder.padEnd(20)} → ${stackIcon.padEnd(16)} mapped as "${displayName}"`);

    return { folder, displayName, hasJs };
  });

console.log('------------------------------------------------====================');
console.log(`📊 Analysis Complete: Detected ${projects.length} valid sandbox projects.`);

/* ==========================================================================
   1. BUILD ROOT INDEX.HTML
   ========================================================================== */
const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <!-- Favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png" />
    <link rel="manifest" href="site.webmanifest" />
    <link rel="stylesheet" href="./style.css" />
    <title>Sandbox Projects</title>
    <script>
      const savedTheme = localStorage.getItem('theme') || 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
    </script>
  </head>

  <body>
    <button id="themeToggle" class="theme-toggle" aria-label="Toggle visual theme mode">🌓</button>

    <header>
      <h1>Sandbox Projects</h1>
      <p>A compilation of my frontend components and responsive layout experiments.</p>

      <div class="search-wrapper">
        <input
          type="text"
          id="searchBar"
          placeholder="🔍 Search labs by name... (Press '/' to focus)"
          aria-label="Search sandbox projects"
          autocomplete="off"
        />
        <span id="searchCounter" class="search-counter">Analyzing logs...</span>
      </div>
    </header>

    <div class="container">
      <ul id="projectList">
        ${projects
          .map(
            project => `
        <li class="project-item" data-name="${project.displayName.toLowerCase()}" data-folder="${project.folder.toLowerCase()}">
          <a href="${project.folder}" target="_blank">${project.displayName}</a>
        </li>`,
          )
          .join('')}
      </ul>

      <div id="noResults" class="no-results-hidden">
        <p>🛸 No matching sandbox projects found.</p>
      </div>
    </div>

    <footer>
      <div class="footer-content">
        <div class="footer-meta">
          <p class="footer-brand">&copy; <span id="currentYear"></span> gbgabiola</p>
          <p class="footer-tagline">Crafting modular UI solutions and fluid layout systems.</p>
        </div>
        <div class="footer-links">
          <a href="https://bit.ly/gbgabiola" target="_blank" rel="noopener noreferrer">Portfolio</a>
          <a href="https://github.com/gbgabiola/sandbox" target="_blank" rel="noopener noreferrer">Source Code</a>
          <a href="https://github.com/gbgabiola" target="_blank" rel="noopener noreferrer">GitHub Profile</a>
        </div>
      </div>
    </footer>

    <script>
      document.getElementById('currentYear').textContent = new Date().getFullYear();

      const searchBar = document.getElementById('searchBar');
      const searchCounter = document.getElementById('searchCounter');
      const noResults = document.getElementById('noResults');

      const totalCount = document.querySelectorAll('.project-item').length;
      searchCounter.textContent = 'Showing all ' + totalCount + ' labs';

      searchBar.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase().trim();
        let matchedCount = 0;

        const liveProjectItems = document.querySelectorAll('.project-item');

        liveProjectItems.forEach(item => {
          const nameAttr = item.getAttribute('data-name') || '';
          const folderAttr = item.getAttribute('data-folder') || '';
          const isMatch = nameAttr.includes(query) || folderAttr.includes(query);

          if (isMatch) {
            item.classList.remove('hidden-item');
            matchedCount++;
          } else {
            item.classList.add('hidden-item');
          }
        });

        if (query === '') {
          searchCounter.textContent = 'Showing all ' + totalCount + ' labs';
          noResults.className = 'no-results-hidden';
        } else {
          searchCounter.textContent = 'Found ' + matchedCount + ' matching result' + (matchedCount === 1 ? '' : 's');
          noResults.className = matchedCount === 0 ? 'no-results-visible' : 'no-results-hidden';
        }
      });

      document.addEventListener('keydown', function(e) {
        if (e.key === '/' && document.activeElement !== searchBar) {
          e.preventDefault();
          searchBar.focus();
          searchBar.select();
        }
      });

      const themeToggleBtn = document.getElementById('themeToggle');
      themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('theme', nextTheme);
      })
    </script>
  </body>
</html>`;

fs.writeFileSync(path.join(rootDir, 'index.html'), htmlContent);
console.log('✍️  [WRITE] Root level "index.html" successfully updated.');

/* ==========================================================================
   2. AUTOMATE ROOT README.MD
   ========================================================================== */
const currentYear = new Date().getFullYear();

const readmeContent = `# Sandbox Project

![Repository Views](https://visitor-badge.laobi.icu/badge?page_id=gbgabiola.sandbox)

Welcome to my personal frontend sandbox! This repository serves as a centralized hub for tracking my frontend stuff. It contains a collection of UI components, interactive web layouts, and standalone design labs.

The primary goal of this sandbox is to focus on **clean architecture**, **semantic accessibility (a11y)**, and **fluid responsive design**.

## 🚀 Live Hub

- **Interactive Sandbox Hub:** [View All Projects Live](https://gbgabiola.github.io/sandbox)

---

## 🗂️ Component Dashboard

Below is a dynamically generated index of the frontend modules available in this workspace. Each component lives in its own root directory for isolated execution.

| Project Name | Stack Type | Technical Stack | Live Demo |
| :--- | :--- | :--- | :--- |
${projects
  .map(p => {
    const stackType = p.hasJs ? '⚡ Interactive' : '🎨 Presentational';
    const techStack = p.hasJs ? '🧱 HTML5, 🎨 CSS3, ⚡ Vanilla JS' : '🧱 HTML5, 🎨 CSS3';
    return `| **[${p.displayName}](./${p.folder})** | ${stackType} | ${techStack} | [Explore Live](https://gbgabiola.github.io/sandbox/${p.folder}/) |`;
  })
  .join('\n')}

---

## 🛠️ Architecture & Conventions

To keep this ecosystem modular and easy to navigate, every project adheres to a strict individual directory layout:

\`\`\`text
sandbox/
├── [project-name]/         <-- Explicit lowercase naming convention
│   ├── index.html          <-- Standalone DOM entry point
│   ├── style.css           <-- Component-scoped visual rules
│   └── script.js           <-- Component-scoped interactive logic (optional)
\`\`\`

- **No Cross-Pollination:** Styles and logic are entirely contained inside their respective project directories.
- **Component-First Isolation:** Any project can be cloned or extracted independently without breaking dependencies.

---

## 💻 Local Setup & Execution

To explore, run, or debug any specific project locally on your machine:

1. **Clone this workspace:**
   \`\`\`bash
   git clone https://github.com/gbgabiola/sandbox.git
   \`\`\`
2. **Change into the repository directory:**
   \`\`\`bash
   cd sandbox
   \`\`\`
3. **Run a local server:**<br />
   Open the root workspace using VS Code and launch the **Live Server** extension, or open individual \`index.html\` files directly inside your preferred web browser.

---

## 🤝 Let's Connect

If you want to talk shop about software engineering or collaboration opportunities, feel free to drop by:

* [Portfolio](https://bit.ly/gbgabiola)
* [LinkedIn](https://www.linkedin.com/in/gbgabiola)
* [X (Twitter)](http://x.com/gbgabiola)

---

&copy; ${currentYear} gbgabiola • This repository is completely open-source and free to adapt under the terms of the [MIT License](LICENSE).
`;

fs.writeFileSync(path.join(rootDir, 'README.md'), readmeContent);
console.log('✍️  [WRITE] Root level "README.md" dashboard documentation compiled.');
console.log('------------------------------------------------====================');
console.log('🎉 [SUCCESS] Deployment pipeline asset updates built clean and complete.');
