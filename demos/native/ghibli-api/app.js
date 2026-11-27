const root = document.querySelector('#root');
const statusElement = document.querySelector('#status');
const retry = document.querySelector('#retry');
async function loadCharacters() {
  retry.hidden = true;
  statusElement.textContent = 'Loading characters…';
  root.replaceChildren();
  try {
    const response = await fetch('https://ghibliapi.vercel.app/people', { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('Request failed');
    const characters = await response.json();
    if (!Array.isArray(characters) || !characters.every((person) => person && typeof person.name === 'string')) throw new Error('Invalid data');
    for (const person of characters) {
      const card = document.createElement('article');
      card.className = 'card';
      const heading = document.createElement('h2');
      heading.textContent = person.name;
      const details = document.createElement('ul');
      for (const [label, value] of [['Gender', person.gender], ['Age', person.age], ['Eye color', person.eye_color], ['Hair color', person.hair_color]]) {
        const item = document.createElement('li');
        item.textContent = `${label}: ${value || 'Unknown'}`;
        details.append(item);
      }
      card.append(heading, details);
      root.append(card);
    }
    statusElement.textContent = `${characters.length} characters loaded.`;
  } catch {
    statusElement.textContent = 'Characters could not be loaded. Check your connection and try again.';
    retry.hidden = false;
  }
}
retry.addEventListener('click', loadCharacters);
loadCharacters();
