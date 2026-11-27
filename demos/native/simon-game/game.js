const colors = ['red', 'blue', 'green', 'yellow'];
const buttons = [...document.querySelectorAll('.container button')];
const start = document.querySelector('#start');
const title = document.querySelector('#level-title');
const statusElement = document.querySelector('#game-status');
let pattern = [];
let position = 0;
let active = false;

function sound(color) { new Audio(`sounds/${color}.mp3`).play().catch(() => {}); }
function flash(color) {
  const button = document.getElementById(color);
  button.classList.add('pressed');
  sound(color);
  setTimeout(() => button.classList.remove('pressed'), 300);
}
function lock(locked) { buttons.forEach((button) => { button.disabled = locked; }); }
function next() {
  position = 0;
  pattern.push(colors[Math.floor(Math.random() * colors.length)]);
  title.textContent = `Level ${pattern.length}`;
  statusElement.textContent = 'Watch the next color.';
  lock(true);
  setTimeout(() => {
    flash(pattern[pattern.length - 1]);
    setTimeout(() => { lock(false); statusElement.textContent = 'Your turn. Repeat the sequence.'; }, 400);
  }, 600);
}
start.addEventListener('click', () => {
  pattern = [];
  active = true;
  start.disabled = true;
  next();
});
buttons.forEach((button) => button.addEventListener('click', () => {
  if (!active) return;
  flash(button.id);
  if (button.id !== pattern[position]) {
    active = false;
    lock(true);
    sound('wrong');
    statusElement.textContent = `Game over at level ${pattern.length}. Start a new game to try again.`;
    start.disabled = false;
    start.textContent = 'Start again';
    return;
  }
  position += 1;
  if (position === pattern.length) next();
}));
