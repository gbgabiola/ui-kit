const min = 1;
const max = 10;
const guessButton = document.querySelector('#guess-btn');
const guessInput = document.querySelector('#guess-input');
const message = document.querySelector('.message');
let answer;
let attempts;
let finished;

document.querySelector('.min-num').textContent = min;
document.querySelector('.max-num').textContent = max;
function reset() {
  answer = Math.floor(Math.random() * (max - min + 1)) + min;
  attempts = 3;
  finished = false;
  guessInput.disabled = false;
  guessInput.value = '';
  guessButton.value = 'Submit guess';
  message.textContent = 'You have three attempts.';
}
function submitGuess() {
  if (finished) { reset(); guessInput.focus(); return; }
  const guess = Number(guessInput.value);
  if (!Number.isInteger(guess) || guess < min || guess > max) {
    message.textContent = `Enter a whole number between ${min} and ${max}.`;
    return;
  }
  attempts -= 1;
  if (guess === answer || attempts === 0) {
    finished = true;
    guessInput.disabled = true;
    guessButton.value = 'Play again';
    message.textContent = guess === answer ? `You won! ${answer} is correct.` : `Game over. The correct number was ${answer}.`;
  } else {
    message.textContent = `${guess} is incorrect. ${attempts} attempts left.`;
    guessInput.value = '';
    guessInput.focus();
  }
}
guessButton.addEventListener('click', submitGuess);
guessInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') { event.preventDefault(); submitGuess(); }
});
reset();
