const progressBar = document.querySelector('.progress-bar');
const start = document.querySelector('.start');
const reset = document.querySelector('.reset');
let timer;
let value = 0;

function render() {
  progressBar.style.opacity = '1';
  progressBar.style.width = value + '%';
  progressBar.textContent = value + '%';
  progressBar.parentElement.setAttribute('aria-valuenow', String(value));
}
start.addEventListener('click', () => {
  clearInterval(timer);
  value = 0;
  start.disabled = true;
  render();
  timer = setInterval(() => {
    value += 1;
    render();
    if (value === 100) {
      clearInterval(timer);
      start.disabled = false;
    }
  }, 25);
});
reset.addEventListener('click', () => {
  clearInterval(timer);
  value = 0;
  start.disabled = false;
  render();
});
render();
