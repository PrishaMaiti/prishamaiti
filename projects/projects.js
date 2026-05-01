import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');
const searchInput = document.querySelector('.searchBar');

let query = '';
let selectedIndex = -1;
let selectedYear = null;
const yearColorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(
	[...new Set(projects.map((project) => project.year))],
);

// Create the pie chart container and SVG dynamically (once at page load)
let containerDiv = document.querySelector('.pie-legend-container');
if (!containerDiv) {
	containerDiv = document.createElement('div');
	containerDiv.className = 'pie-legend-container';

	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('id', 'projects-pie-plot');
	svg.setAttribute('viewBox', '-50 -50 100 100');
	svg.setAttribute('role', 'img');
	svg.setAttribute('aria-label', 'Projects pie chart');

	const legend = document.createElement('ul');
	legend.className = 'legend';

	containerDiv.appendChild(svg);
	containerDiv.appendChild(legend);
	projectsContainer.parentNode.insertBefore(containerDiv, projectsContainer);
}

// Function to render the pie chart with given projects
function renderPieChart(projectsGiven) {
	const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

	// Build data: counts of projects by year using d3.rollups()
	const rolledData = d3.rollups(
		projectsGiven,
		(v) => v.length,
		(d) => d.year,
	);

	let data = rolledData.map(([year, count]) => {
		return { value: count, label: year };
	});
	// sort by value desc for nicer legend ordering
	data.sort((a, b) => b.value - a.value);

	if (selectedYear) {
		selectedIndex = data.findIndex((d) => d.label === selectedYear);
	} else {
		selectedIndex = -1;
	}

	const sliceGenerator = d3.pie().value((d) => d.value);
	const arcData = sliceGenerator(data);
	const arcs = arcData.map((d) => arcGenerator(d));

	// Clear existing paths and legend items
	const svgD3 = d3.select('#projects-pie-plot');
	svgD3.selectAll('path').remove();
	const legendD3 = d3.select('.legend');
	legendD3.selectAll('li').remove();

	if (data.length === 0) {
		return;
	}

	// Render pie chart paths
	arcs.forEach((arc, idx) => {
		svgD3
			.append('path')
			.attr('d', arc)
			.attr('fill', yearColorScale(data[idx].label))
			.attr('stroke', 'white')
			.attr('stroke-width', 1.5)
			.attr('class', idx === selectedIndex ? 'selected' : null)
			.on('click', () => {
				selectedIndex = selectedIndex === idx ? -1 : idx;
				selectedYear = selectedIndex === -1 ? null : data[idx].label;
				renderPage();
			});
	});

	// Render legend
	if (!legendD3.empty()) {
		data.forEach((d, idx) => {
			legendD3
				.append('li')
				.attr('class', idx === selectedIndex ? 'legend-item selected' : 'legend-item')
				.attr('style', `--color:${yearColorScale(d.label)}`)
				.on('click', () => {
					selectedIndex = selectedIndex === idx ? -1 : idx;
					selectedYear = selectedIndex === -1 ? null : d.label;
					renderPage();
				})
				.html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
		});
	}
}

function getVisibleProjects() {
	const filteredByQuery = projects.filter((project) => {
		const values = Object.values(project).join('\n').toLowerCase();
		return values.includes(query.toLowerCase());
	});

	if (selectedYear) {
		return filteredByQuery.filter((project) => project.year === selectedYear);
	}

	return filteredByQuery;
}

function renderPage() {
	const visibleProjects = getVisibleProjects();
	renderProjects(visibleProjects, projectsContainer, 'h2');

	if (projectsTitle) {
		projectsTitle.textContent = `${visibleProjects.length} Projects`;
	}

	renderPieChart(visibleProjects);
}

// Render projects and pie chart on page load
renderPage();

// Add search functionality
searchInput.addEventListener('input', (event) => {
	query = event.target.value;
	renderPage();
});
