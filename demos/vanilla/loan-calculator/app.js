const form = document.querySelector('#loan-form');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const principal = Number(document.querySelector('#amount').value);
  const annualInterest = Number(document.querySelector('#interest').value);
  const years = Number(document.querySelector('#years').value);
  const results = document.querySelector('#results');
  const error = document.querySelector('#error');
  error.textContent = '';
  results.style.display = 'none';
  if (![principal, annualInterest, years].every(Number.isFinite) || principal <= 0 || annualInterest < 0 || years <= 0) {
    error.textContent = 'Enter a positive loan amount and term, and an interest rate of zero or more.';
    return;
  }
  const rate = annualInterest / 1200;
  const payments = years * 12;
  const monthly = rate === 0 ? principal / payments : principal * rate / (1 - Math.pow(1 + rate, -payments));
  if (!Number.isFinite(monthly)) {
    error.textContent = 'These values exceed the supported calculation range.';
    return;
  }
  document.querySelector('#monthly-payment').value = monthly.toFixed(2);
  document.querySelector('#total-payment').value = (monthly * payments).toFixed(2);
  document.querySelector('#total-interest').value = (monthly * payments - principal).toFixed(2);
  results.style.display = 'block';
});
