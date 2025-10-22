// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    loadDynamicData();
});


// --- Mobile Menu Logic ---
function initMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileNavLinks = document.querySelectorAll('#mobile-menu a');

    // Toggle mobile menu
    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // Close mobile menu when a link is clicked (for mobile only)
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (event) => {
        const isClickInsideMenu = mobileMenu.contains(event.target);
        const isClickOnBtn = menuBtn.contains(event.target);

        if (!isClickInsideMenu && !isClickOnBtn && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
        }
    });
}

// --- Data Population Logic ---

/**
 * Fetches data from data.json and populates all dynamic sections.
 */
async function loadDynamicData() {
    try {
        const response = await fetch('./data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const { piName, researchPillars, publications, events, team } = data;

        // Get all container elements
        const researchGrid = document.getElementById('research-grid');
        const publicationsList = document.getElementById('publications-list');
        const eventsGrid = document.getElementById('events-grid');
        const piSection = document.getElementById('pi-section');
        const teamGrid = document.getElementById('team-grid');

        // Populate all sections
        if (researchGrid) {
            researchGrid.innerHTML = researchPillars.map(renderResearchPillar).join('');
        }
        if (publicationsList) {
            publicationsList.innerHTML = publications.map(pub => renderPublication(pub, piName)).join('');
        }
        if (eventsGrid) {
            // We pass piName to replace the placeholder in event descriptions
            const piFirstName = team.principalInvestigator.name.split(' ')[1]; // "Evelyn"
            const piShortName = `Dr. ${piFirstName}`; // "Dr. Evelyn"
            eventsGrid.innerHTML = events.map(event => renderEvent(event, piName, piShortName)).join('');
        }
        if (piSection) {
            piSection.innerHTML = renderPI(team.principalInvestigator);
        }
        if (teamGrid) {
            const membersHtml = team.members.map(renderTeamMember).join('');
            // Find the "Join Us" card and insert members *before* it
            const joinUsCard = teamGrid.querySelector('.bg-blue-50');
            if (joinUsCard) {
                joinUsCard.insertAdjacentHTML('beforebegin', membersHtml);
            } else {
                teamGrid.innerHTML = membersHtml; // Fallback if card not found
            }
        }

    } catch (error) {
        console.error("Failed to load lab data:", error);
        // You could display a user-friendly error message in the containers
        const researchGrid = document.getElementById('research-grid');
        if (researchGrid) researchGrid.innerHTML = "<p class='text-red-500'>Failed to load research data.</p>";
    }
}

/**
 * Creates HTML for a single publication, highlighting the PI's name.
 */
function renderPublication(pub, piName) {
    // Create the author string, bolding the PI
    const authorsHtml = pub.authors.map(author =>
        author === piName
            ? `<span class="font-bold text-gray-700 dark:text-gray-200">${author}</span>`
            : author
    ).join(', ');

    return `
    <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition-shadow hover:shadow-lg">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">${pub.title}</h3>
        <p class="text-gray-500 dark:text-gray-400 mt-2">
            ${authorsHtml} | ${pub.journal}
        </p>
        <a href="${pub.url}" class="inline-block text-blue-500 dark:text-blue-400 hover:underline mt-3 font-medium">
            Read Paper &rarr;
        </a>
    </div>`;
}

/**
 * Creates HTML for a single research pillar.
 */
function renderResearchPillar(pillar) {
    return `
    <div class="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div class="text-blue-500 dark:text-blue-400 mb-4">
            ${pillar.iconSvg} 
        </div>
        <h3 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            ${pillar.title}
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
            ${pillar.description}
        </p>
    </div>`;
}

/**
 * Creates HTML for a single event.
 */
function renderEvent(event, piName, piShortName) {
    // Replace placeholder with the PI's name
    const descriptionHtml = event.description
        .replace('[[PI_NAME_FULL]]', piName)
        .replace('[[PI_NAME]]', piShortName); // Use short name for "Dr. Kestrel"

    return `
    <div class="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex space-x-6">
        <div class="flex-shrink-0 text-center bg-blue-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <span class="block text-3xl font-bold text-blue-600 dark:text-blue-400">${event.day}</span>
            <span class="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">${event.month}</span>
        </div>
        <div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">${event.title}</h3>
            <p class="text-gray-500 dark:text-gray-400 mt-1">${descriptionHtml}</p>
            <span class="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        ${event.location}
            </span>
        </div>
    </div>`;
}

/**
 * Creates HTML for the Principal Investigator section.
 */
function renderPI(pi) {
    return `
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden md:flex border border-gray-200 dark:border-gray-700">
        <div class="md:flex-shrink-0">
            <img class="h-48 w-full object-cover md:h-full md:w-64" src="${pi.imageUrl}" alt="${pi.name}">
        </div>
        <div class="p-8">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">${pi.name}</h3>
            <p class="text-blue-500 dark:text-blue-400 text-lg font-medium mb-4">${pi.title}</p>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
                ${pi.bio}
            </p>
            <a href="${pi.bioUrl}" class="text-blue-500 dark:text-blue-400 hover:underline font-medium">View Full Bio &rarr;</a>
        </div>
    </div>`;
}

/**
 * Creates HTML for a single team member.
 */
function renderTeamMember(member) {
    return `
    <div class="text-center bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <img class="w-32 h-32 rounded-full mx-auto mb-4" src="${member.imageUrl}" alt="${member.name}">
        <h4 class="text-xl font-semibold text-gray-900 dark:text-white">${member.name}</h4>
        <p class="text-gray-500 dark:text-gray-400">${member.title}</p>
    </div>`;
}