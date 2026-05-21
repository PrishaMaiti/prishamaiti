console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'resume/', title: 'Resume' },
  { url: 'https://github.com/PrishaMaiti', title: 'GitHub' },
];

const BASE_PATH =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? '/'
    : '/prishamaiti/';

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  url = !url.startsWith('http') ? BASE_PATH + url : url;

  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === location.pathname,
  );

  if (a.host !== location.host) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }

  nav.append(a);
}

document.body.insertAdjacentHTML(
  'afterbegin',
  `
    <label class="color-scheme">
      Theme:
      <select>
        <option value="light dark">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  `,
);

let select = document.querySelector('.color-scheme select');

function applyTheme(scheme) {
  document.documentElement.style.setProperty('color-scheme', scheme);
  document.documentElement.dataset.theme =
    scheme === 'light dark' ? 'auto' : scheme;
}

if ('colorScheme' in localStorage) {
  applyTheme(localStorage.colorScheme);
  select.value = localStorage.colorScheme;
} else {
  applyTheme(select.value);
}

select.addEventListener('input', function (event) {
  let scheme = event.target.value;
  applyTheme(scheme);
  localStorage.colorScheme = scheme;
});

let form = document.querySelector('form[action^="mailto:"]');

form?.addEventListener('submit', function (event) {
  event.preventDefault();

  let data = new FormData(form);
  let params = [];

  for (let [name, value] of data) {
    params.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
  }

  let url = `${form.action}?${params.join('&')}`;
  location.href = url;
});

export async function fetchJSON(url) {
  try {
    // Fetch the JSON file from the given URL
    const response = await fetch(url);
    console.log(response);

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  if (!(containerElement instanceof Element)) {
    console.error('renderProjects: containerElement is invalid.');
    return;
  }

  containerElement.innerHTML = '';

  if (!Array.isArray(projects) || projects.length === 0) {
    containerElement.innerHTML = '<p>No projects found.</p>';
    return;
  }

  const validHeadingLevel = /^h[1-6]$/i.test(headingLevel)
    ? headingLevel.toLowerCase()
    : 'h2';

  for (let project of projects) {
    const article = document.createElement('article');

    const title = project?.title || 'Untitled project';
    const image = project?.image || 'https://vis-society.github.io/labs/2/images/empty.svg';
    const description = project?.description || 'No description provided.';
    const year = project?.year || 'Year unknown';

    article.innerHTML = `
      <${validHeadingLevel}>${title}</${validHeadingLevel}>
      <img src="${image}" alt="${project?.alt || title}">
      <div class="project-details">
        <p>${description}</p>
        <p class="project-year">Year: ${year}</p>
      </div>
    `;

    containerElement.appendChild(article);
  }
}