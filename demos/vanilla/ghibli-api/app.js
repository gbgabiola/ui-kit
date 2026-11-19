const app = document.getElementById('root');

const container = document.createElement('div');
container.setAttribute('class', 'container');

app.appendChild(container);

const request = new XMLHttpRequest();
request.open('GET', 'https://ghibliapi.herokuapp.com/people', true);
request.onload = function () {
  const data = JSON.parse(this.response);

  if (request.status >= 200 && request.status < 400) {
    data.forEach(person => {
      const card = document.createElement('div');
      card.setAttribute('class', 'card');

      const name = document.createElement('h1');
      name.textContent = person.name;

      const ul = document.createElement('ul');

      function createMenuItem(item) {
        const li = document.createElement('li');
        li.textContent = item;
        return li;
      }

      ul.appendChild(createMenuItem(`Gender: ${person.gender}`));
      ul.appendChild(createMenuItem(`Age: ${person.age}`));
      ul.appendChild(createMenuItem(`Eye Color: ${person.eye_color}`));
      ul.appendChild(createMenuItem(`Hair Color: ${person.hair_color}`));

      container.appendChild(card);
      card.appendChild(name);
      card.appendChild(ul);
    });
  } else {
    const errorMessage = document.createElement('marquee');
    errorMessage.setAttribute('scrollamount', '20');
    errorMessage.textContent = `Sorry, it's not working this time. Try again later!`;
    app.appendChild(errorMessage);
  }
};

request.send();
