// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    loadDynamicData();
});


// --- Mobile Menu Logic ---
function initMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    // Select all nav links (desktop and mobile)
    const navLinks = document.querySelectorAll('header a[href^="#"]');

    // Toggle mobile menu
    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // Add click listener to all nav links to close mobile menu
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (!mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
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

        const { piName, researchPillars, publications, events, team, contactInfo } = data;

        // Get all container elements
        const researchGrid = document.getElementById('research-grid');
        const publicationsList = document.getElementById('publications-list');
        const eventsGrid = document.getElementById('events-grid');
        const piSection = document.getElementById('pi-section');
        const teamGrid = document.getElementById('team-grid');
        const labAddressContainer = document.getElementById('lab-address');
        const contactEmailLink = document.getElementById('contact-email');

        // Populate all sections
        if (researchGrid) {
            researchGrid.innerHTML = researchPillars.map(renderResearchPillar).join('');
        }
        if (publicationsList) {
            publicationsList.innerHTML = publications.map(pub => renderPublication(pub, piName)).join('');
        }
        if (eventsGrid) {
            const piFirstName = team.principalInvestigator.name.split(' ')[1];
            const piShortName = `Dr. ${piFirstName}`;
            eventsGrid.innerHTML = events.map(event => renderEvent(event, piName, piShortName)).join('');
        }
        if (piSection) {
            piSection.innerHTML = renderPI(team.principalInvestigator);
        }
        if (teamGrid) {
            const membersHtml = team.members.map(renderTeamMember).join('');
            const joinUsCard = teamGrid.querySelector('.bg-blue-50');
            if (joinUsCard) {
                joinUsCard.insertAdjacentHTML('beforebegin', membersHtml);
            } else {
                teamGrid.innerHTML = membersHtml;
            }
        }
        if (labAddressContainer) {
            labAddressContainer.innerHTML = contactInfo.address.join('<br>');
        }
        if (contactEmailLink) {
            contactEmailLink.href = `mailto:${contactInfo.email}`;
            contactEmailLink.textContent = contactInfo.email;
        }

    } catch (error) {
        console.error("Failed to load lab data:", error);
        const researchGrid = document.getElementById('research-grid');
        if (researchGrid) researchGrid.innerHTML = "<p class='text-red-500'>Failed to load research data.</p>";
    }
}

/**
 * Creates HTML for a single publication, highlighting the PI's name.
 */
function renderPublication(pub, piName) {
    // Handle authors array, bolding the PI's name
    const authorsHtml = pub.authors.map(author =>
        author.includes(piName)
            ? `<span class="font-bold text-gray-700 dark:text-gray-200">${author}</span>`
            : author
    ).join(', ');

    return `
    <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition-shadow hover:shadow-lg">
        <a href="${pub.url}" target="_blank" rel="noopener noreferrer" class="hover:underline">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">${pub.title}</h3>
        </a>
        <p class="text-gray-500 dark:text-gray-400 mt-2">
            ${authorsHtml}
        </p>
        <p class="text-gray-600 dark:text-gray-300 italic mt-1">
            ${pub.journal}
        </p>
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
    const descriptionHtml = event.description.replace('[[PI_NAME]]', piShortName);

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
    const scholarIcon = `<svg fill="currentColor" class="w-5 h-5" viewBox="0 0 24 24"><path d="M12 24a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm0-24L0 9.5l4.838 3.39L12 18l7.162-5.11L24 9.5z"/></svg>`;
    const githubIcon = `<svg fill="currentColor" class="w-5 h-5" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>`;

    return `
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden md:flex border border-gray-200 dark:border-gray-700">
        <div class="md:flex-shrink-0">
            <img class="h-48 w-full object-cover md:h-full md:w-64" src="${pi.imageUrl}" alt="${pi.name}">
        </div>
        <div class="p-8">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-2xl font-bold text-gray-900 dark:text-white">${pi.name}</h3>
                    <p class="text-blue-500 dark:text-blue-400 text-lg font-medium mb-4">${pi.title}</p>
                </div>
                <div class="flex space-x-3 text-gray-500 dark:text-gray-400">
                    <a href="${pi.scholarUrl}" target="_blank" rel="noopener noreferrer" class="hover:text-blue-500 dark:hover:text-blue-400">${scholarIcon}</a>
                    <a href="${pi.githubUrl}" target="_blank" rel="noopener noreferrer" class="hover:text-blue-500 dark:hover:text-blue-400">${githubIcon}</a>
                </div>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
                ${pi.bio}
            </p>
            <a href="${pi.bioUrl}" class="text-blue-500 dark:text-blue-400 hover:underline font-medium">View Full Bio &rarr;</a>
        </div>
    </div>`;
}

/**
 * Creates HTML for a single team member with hover effect.
 */
function renderTeamMember(member) {
    const scholarIcon = `<svg fill="currentColor" class="w-6 h-6" viewBox="0 0 24 24"><path d="M12 24a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm0-24L0 9.5l4.838 3.39L12 18l7.162-5.11L24 9.5z"/></svg>`;
    const githubIcon = `<svg fill="currentColor" class="w-6 h-6" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>`;

    return `
    <div class="group relative text-center bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <img class="w-full h-48 object-cover" src="${member.imageUrl}" alt="${member.name}" onerror="this.src='https://placehold.co/300x300/E5E7EB/374151?text=Photo';">
        <div class="p-4">
            <h4 class="text-xl font-semibold text-gray-900 dark:text-white">${member.name}</h4>
            <p class="text-gray-500 dark:text-gray-400">${member.title}</p>
        </div>
        
        <div class="team-card-overlay absolute inset-0 flex flex-col justify-center items-center space-y-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            ${member.scholarUrl ? `<a href="${member.scholarUrl}" target="_blank" rel="noopener noreferrer" class="hover:text-blue-400 transition-colors">${scholarIcon}</a>` : ''}
            ${member.githubUrl ? `<a href="${member.githubUrl}" target="_blank" rel="noopener noreferrer" class="hover:text-blue-400 transition-colors">${githubIcon}</a>` : ''}
        </div>
    </div>`;
}