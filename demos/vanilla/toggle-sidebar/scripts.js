const button = document.querySelector('button.btn');
const sidebar = document.querySelector('.sidebar');
function setOpen(open) {
  button.setAttribute('aria-expanded', String(open));
  button.textContent = open ? 'Close navigation' : 'Open navigation';
  sidebar.classList.toggle('is-hidden', !open);
  sidebar.inert = !open;
}
button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
    setOpen(false);
    button.focus();
  }
});
sidebar.addEventListener('click', (event) => {
  if (event.target.closest('a')) { setOpen(false); button.focus(); }
});
