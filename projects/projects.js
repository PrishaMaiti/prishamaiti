import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');

renderProjects(projects, projectsContainer, 'h2');

const count = Array.isArray(projects) ? projects.length : 0;
if (projectsTitle) {
	projectsTitle.textContent = `${count} Projects`;
}
