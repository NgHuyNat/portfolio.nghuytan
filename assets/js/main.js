/*===== MENU SHOW =====*/ 
const showMenu = (toggleId, navId) =>{
    const toggle = document.getElementById(toggleId),
    nav = document.getElementById(navId)

    if(toggle && nav){
        toggle.addEventListener('click', ()=>{
            nav.classList.toggle('show')
        })
    }
}
showMenu('nav-toggle','nav-menu')

/*==================== DARK LIGHT THEME ====================*/ 
const themeButton = document.getElementById('theme-button')
const themeIcon = document.getElementById('theme-icon')
const darkTheme = 'dark-theme'
const iconTheme = 'bx-sun'

// Previously selected theme (if user selected)
const selectedTheme = localStorage.getItem('selected-theme')
const selectedIcon = localStorage.getItem('selected-icon')

// We obtain the current theme that the interface has by validating the dark-theme class
const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light'
const getCurrentIcon = () => themeIcon.classList.contains(iconTheme) ? 'bx-moon' : 'bx-sun'

// We validate if the user previously chose a theme
if (selectedTheme) {
  // If the validation is fulfilled, we ask what the issue was to know if we activated or deactivated the dark theme
  document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme)
  themeIcon.classList[selectedIcon === 'bx-moon' ? 'add' : 'remove'](iconTheme)
}

// Activate / deactivate the theme manually with the button
themeButton.addEventListener('click', () => {
    // Add or remove the dark / icon theme
    document.body.classList.toggle(darkTheme)
    themeIcon.classList.toggle(iconTheme)
    // We save the theme and the current icon that the user chose
    localStorage.setItem('selected-theme', getCurrentTheme())
    localStorage.setItem('selected-icon', getCurrentIcon())
})

/*==================== REMOVE MENU MOBILE ====================*/
const navLink = document.querySelectorAll('.nav__link')

function linkAction(){
    const navMenu = document.getElementById('nav-menu')
    // When we click on each nav__link, we remove the show-menu class
    navMenu.classList.remove('show')
}
navLink.forEach(n => n.addEventListener('click', linkAction))

/*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
const sections = document.querySelectorAll('section[id]')

const scrollActive = () =>{
    const scrollDown = window.scrollY

  sections.forEach(current =>{
        const sectionHeight = current.offsetHeight,
              sectionTop = current.offsetTop - 58,
              sectionId = current.getAttribute('id'),
              sectionsClass = document.querySelector('.nav__menu a[href*=' + sectionId + ']')
        
        if(scrollDown > sectionTop && scrollDown <= sectionTop + sectionHeight){
            sectionsClass.classList.add('active-link')
        }else{
            sectionsClass.classList.remove('active-link')
        }                                                    
    })
}
window.addEventListener('scroll', scrollActive)

/*==================== GITHUB PROJECTS FUNCTIONALITY ====================*/
class GitHubService {
    constructor() {
        this.username = 'nghuynat' // Your GitHub username
        this.baseUrl = 'https://api.github.com'
        this.cache = JSON.parse(localStorage.getItem('githubProjects')) || null
        this.cacheExpiry = 30 * 60 * 1000 // 30 minutes
    }

    // Get all repositories from GitHub
    async getRepositories() {
        try {
            // Check cache first
            if (this.cache && (Date.now() - this.cache.timestamp) < this.cacheExpiry) {
                return this.cache.data
            }

            const response = await fetch(`${this.baseUrl}/users/${this.username}/repos?sort=updated&per_page=50`)
            if (!response.ok) throw new Error('Failed to fetch repositories')
            
            const repos = await response.json()
            
            // Filter out forks and transform data
            const projects = repos
                .filter(repo => !repo.fork)
                .map(repo => this.transformRepo(repo))
                .sort((a, b) => new Date(b.updated) - new Date(a.updated))

            // Cache the results
            this.cache = {
                data: projects,
                timestamp: Date.now()
            }
            localStorage.setItem('githubProjects', JSON.stringify(this.cache))

            return projects
        } catch (error) {
            console.error('Error fetching GitHub repositories:', error)
            return this.cache ? this.cache.data : []
        }
    }

    // Transform GitHub repo data to our project format
    transformRepo(repo) {
        return {
            id: repo.id,
            name: repo.name,
            description: repo.description || 'No description available',
            language: repo.language || 'Unknown',
            category: this.categorizeProject(repo.language, repo.topics),
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            updated: new Date(repo.updated_at).toLocaleDateString(),
            url: repo.html_url,
            homepage: repo.homepage,
            topics: repo.topics || [],
            size: repo.size,
            isPrivate: repo.private
        }
    }

    // Categorize project based on language and topics
    categorizeProject(language, topics = []) {
        const topicsStr = topics.join(' ').toLowerCase()
        
        if (topicsStr.includes('react') || topicsStr.includes('vue') || topicsStr.includes('angular') || 
            language === 'JavaScript' && (topicsStr.includes('frontend') || topicsStr.includes('ui'))) {
            return 'frontend'
        }
        
        if (topicsStr.includes('mobile') || topicsStr.includes('android') || topicsStr.includes('ios') || 
            language === 'Swift' || language === 'Kotlin' || language === 'Dart') {
            return 'mobile'
        }
        
        if (topicsStr.includes('fullstack') || topicsStr.includes('full-stack') || 
            (topicsStr.includes('frontend') && topicsStr.includes('backend'))) {
            return 'fullstack'
        }
        
        if (language === 'Go' || language === 'Python' || language === 'Java' || 
            language === 'C#' || language === 'PHP' || language === 'Rust' ||
            topicsStr.includes('backend') || topicsStr.includes('api')) {
            return 'backend'
        }
        
        return 'backend' // Default category
    }

    // Get language color for display
    getLanguageColor(language) {
        const colors = {
            'JavaScript': '#f1e05a',
            'TypeScript': '#2b7489',
            'Python': '#3572A5',
            'Java': '#b07219',
            'Go': '#00ADD8',
            'Rust': '#dea584',
            'C++': '#f34b7d',
            'C': '#555555',
            'C#': '#239120',
            'PHP': '#4F5D95',
            'Swift': '#ffac45',
            'Kotlin': '#F18E33',
            'Dart': '#00B4AB',
            'HTML': '#e34c26',
            'CSS': '#1572B6',
            'Vue': '#4FC08D',
            'React': '#61DAFB'
        }
        return colors[language] || '#666666'
    }
}

// Initialize GitHub service
const githubService = new GitHubService()
let allProjects = []

// Project Filter
const projectFilters = document.querySelectorAll('.work__filter-btn')

function filterProjects() {
    projectFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            const targetData = filter.getAttribute('data-filter')
            
            document.querySelectorAll('.work__project').forEach(project => {
                if(targetData === 'all' || project.getAttribute('data-category') === targetData) {
                    project.classList.remove('hidden')
                    project.style.animation = 'slideInUp 0.5s ease forwards'
                } else {
                    project.classList.add('hidden')
                }
            })
            
            // Update active filter
            projectFilters.forEach(btn => btn.classList.remove('active-filter'))
            filter.classList.add('active-filter')
        })
    })
}

// Load projects from GitHub
async function loadProjects() {
    const container = document.getElementById('projectsContainer')
    
    try {
        // Show loading
        container.innerHTML = `
            <div class="work__loading">
                <i class='bx bx-loader-alt bx-spin'></i>
                <p>Loading projects from GitHub...</p>
            </div>
        `

        allProjects = await githubService.getRepositories()
        renderProjects()
    } catch (error) {
        console.error('Error loading projects:', error)
        container.innerHTML = `
            <div class="work__error">
                <i class='bx bx-error'></i>
                <p>Error loading projects. Please try again later.</p>
                <button class="btn btn--primary" onclick="loadProjects()">Retry</button>
            </div>
        `
    }
}

// Render projects
function renderProjects() {
    const container = document.getElementById('projectsContainer')
    
    if (allProjects.length === 0) {
        container.innerHTML = `
            <div class="work__empty">
                <i class='bx bx-git-repo-forked'></i>
                <p>No projects found.</p>
            </div>
        `
        return
    }

    container.innerHTML = allProjects.map(project => createProjectElement(project)).join('')
}

// Create project element
function createProjectElement(project) {
    const languageColor = githubService.getLanguageColor(project.language)
    
    return `
        <article class="work__project" data-category="${project.category}">
            <div class="work__img">
                <div class="work__project-header">
                    <div class="work__project-info">
                        <h3 class="work__project-title">${project.name}</h3>
                        <div class="work__project-meta">
                            <span class="work__language" style="background-color: ${languageColor}">
                                ${project.language}
                            </span>
                            <span class="work__updated">Updated ${project.updated}</span>
                        </div>
                    </div>
                    ${project.isPrivate ? '<i class="bx bx-lock work__private"></i>' : ''}
                </div>
                
                <p class="work__project-description">${project.description}</p>
                
                ${project.topics.length > 0 ? `
                    <div class="work__topics">
                        ${project.topics.slice(0, 5).map(topic => 
                            `<span class="work__topic">${topic}</span>`
                        ).join('')}
                    </div>
                ` : ''}
                
                <div class="work__project-stats">
                    <div class="work__stat">
                        <i class='bx bx-star'></i>
                        <span>${project.stars}</span>
                    </div>
                    <div class="work__stat">
                        <i class='bx bx-git-repo-forked'></i>
                        <span>${project.forks}</span>
                    </div>
                    <div class="work__stat">
                        <i class='bx bx-file'></i>
                        <span>${(project.size / 1024).toFixed(1)}KB</span>
                    </div>
                </div>
                
                <div class="work__project-actions">
                    <a href="${project.url}" target="_blank" class="work__btn work__btn-primary">
                        <i class='bx bx-link-external'></i> View Code
                    </a>
                    ${project.homepage ? `
                        <a href="${project.homepage}" target="_blank" class="work__btn work__btn-secondary">
                            <i class='bx bx-globe'></i> Live Demo
                        </a>
                    ` : ''}
                </div>
            </div>
        </article>
    `
}

// Refresh projects
const refreshBtn = document.getElementById('refreshProjectsBtn')
if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
        // Clear cache and reload
        localStorage.removeItem('githubProjects')
        githubService.cache = null
        loadProjects()
        showNotification('Projects refreshed from GitHub!')
    })
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div')
    notification.className = 'notification'
    notification.textContent = message
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: var(--first-color);
        color: white;
        padding: 1rem 2rem;
        border-radius: 0.5rem;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
        notification.remove()
    }, 3000)
}

// Initialize projects functionality
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('projectsContainer')) {
        filterProjects()
        loadProjects()
    }
})

/*===== SCROLL REVEAL ANIMATION =====*/
const sr = ScrollReveal({
    origin: 'top',
    distance: '60px',
    duration: 2000,
    delay: 200,
//     reset: true
});

sr.reveal('.home__data, .about__img, .skills__subtitle, .skills__text',{}); 
sr.reveal('.home__img, .about__subtitle, .about__text, .skills__img',{delay: 400}); 
sr.reveal('.home__social-icon',{ interval: 200}); 
sr.reveal('.skills__data, .work__controls, .work__project, .contact__input',{interval: 200});
