// Sample Events Data

function showBanner(message, type = 'info') {
    const id = 'app-banner';
    let banner = document.getElementById(id);
    if (!banner) {
        banner = document.createElement('div');
        banner.id = id;
        banner.style.position = 'fixed';
        banner.style.top = '80px';
        banner.style.left = '50%';
        banner.style.transform = 'translateX(-50%)';
        banner.style.maxWidth = '900px';
        banner.style.width = 'calc(100% - 2rem)';
        banner.style.padding = '0.9rem 1.1rem';
        banner.style.borderRadius = '0.75rem';
        banner.style.zIndex = '3000';
        banner.style.boxShadow = '0 10px 30px rgba(0,0,0,0.12)';
        banner.style.fontWeight = '600';
        document.body.appendChild(banner);
    }

    const colors = {
        success: { bg: '#d1fae5', text: '#065f46' },
        error: { bg: '#fee2e2', text: '#b91c1c' },
        info: { bg: '#dbeafe', text: '#1e40af' }
    };
    const palette = colors[type] || colors.info;
    banner.style.backgroundColor = palette.bg;
    banner.style.color = palette.text;
    banner.innerHTML = String(message).replace(/
/g, '<br>');

    clearTimeout(window.__bannerTimer);
    window.__bannerTimer = setTimeout(() => {
        if (banner) banner.remove();
    }, 3500);
}

const eventsData = [
    {
        id: 1,
        name: 'Annual Tech Summit',
        college: 'MIT College',
        category: 'Technology',
        date: '2026-02-15',
        time: '10:00 AM',
        venue: 'Main Auditorium',
        fee: 500,
        maxParticipants: 200,
        registered: 150,
        description: 'Join industry leaders for an exciting tech summit featuring keynotes, workshops, and networking opportunities.',
        image: 'Tech Summit'
    },
    {
        id: 2,
        name: 'Cultural Fest',
        college: 'Delhi University',
        category: 'Culture',
        date: '2026-02-20',
        time: '06:00 PM',
        venue: 'Open Ground',
        fee: 200,
        maxParticipants: 500,
        registered: 320,
        description: 'Celebrate diversity with music, dance, food, and cultural performances from around the world.',
        image: 'Cultural Fest'
    },
    {
        id: 3,
        name: 'Hackathon 2026',
        college: 'IIT Bombay',
        category: 'Competition',
        date: '2026-03-01',
        time: '09:00 AM',
        venue: 'Innovation Lab',
        fee: 1000,
        maxParticipants: 100,
        registered: 85,
        description: 'A 24-hour hackathon where students build innovative solutions to real-world problems. Win amazing prizes!',
        image: 'Hackathon'
    },
    {
        id: 4,
        name: 'Sports Day',
        college: 'Delhi Public School',
        category: 'Sports',
        date: '2026-02-25',
        time: '08:00 AM',
        venue: 'Sports Complex',
        fee: 300,
        maxParticipants: 400,
        registered: 275,
        description: 'Inter-college sports competition featuring cricket, football, badminton, and track & field events.',
        image: 'Sports Day'
    },
    {
        id: 5,
        name: 'Business Conclave',
        college: 'XLRI',
        category: 'Business',
        date: '2026-03-05',
        time: '02:00 PM',
        venue: 'Convention Hall',
        fee: 800,
        maxParticipants: 150,
        registered: 120,
        description: 'Connect with entrepreneurs and business leaders. Learn about startups, investments, and business opportunities.',
        image: 'Business Conclave'
    },
    {
        id: 6,
        name: 'Art Exhibition',
        college: 'Rachna Sansad',
        category: 'Arts',
        date: '2026-03-10',
        time: '11:00 AM',
        venue: 'Art Gallery',
        fee: 100,
        maxParticipants: 300,
        registered: 180,
        description: 'Showcase of contemporary and traditional art from emerging artists. Free art workshops available.',
        image: 'Art Exhibition'
    }
];

// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
    renderEvents();
    setupFormHandlers();
});

// Render Events
function renderEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    eventsGrid.innerHTML = '';

    eventsData.forEach(event => {
        const eventCard = createEventCard(event);
        eventsGrid.appendChild(eventCard);
    });
}

// Create Event Card
function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';

    const slotsFilled = (event.registered / event.maxParticipants) * 100;
    const slotsAvailable = event.maxParticipants - event.registered;

    card.innerHTML = `
        <div class="event-header">
            <span class="event-category">${event.category}</span>
            <h3>${event.name}</h3>
            <p style="opacity: 0.9; font-size: 0.9rem; margin-top: 0.5rem;">${event.college}</p>
        </div>
        <div class="event-body">
            <div class="event-info">
                <span>📅 ${formatDate(event.date)}</span>
                <span>🕐 ${event.time}</span>
            </div>
            <div class="event-info">
                <span>📍 ${event.venue}</span>
            </div>
            <p class="event-description">${event.description}</p>
            <div class="event-price">₹${event.fee}</div>
            <div class="event-slots">
                <span class="slots-available">${slotsAvailable} slots available</span>
            </div>
            <div class="slots-bar">
                <div class="slots-fill" style="width: ${slotsFilled}%"></div>
            </div>
            <div class="event-footer" style="margin-top: 1rem;">
                <button class="btn btn-secondary" onclick="viewEventDetails(${event.id})">View Details</button>
                <button class="btn btn-primary" onclick="registerEvent(${event.id}, '${event.name}')">Register</button>
            </div>
        </div>
    `;

    return card;
}

// Format Date
function formatDate(dateString) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

// View Event Details
function viewEventDetails(eventId) {
    const event = eventsData.find(e => e.id === eventId);
    if (!event) return;

    const modal = document.getElementById('eventModal');
    const eventDetails = document.getElementById('eventDetails');

    const slotsFilled = (event.registered / event.maxParticipants) * 100;

    eventDetails.innerHTML = `
        <h2>${event.name}</h2>
        <p style="color: #64748b; margin-bottom: 1.5rem;">${event.description}</p>

        <div class="detail-item">
            <span class="detail-label">📍 Venue</span>
            <span class="detail-value">${event.venue}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">📅 Date</span>
            <span class="detail-value">${formatDate(event.date)}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">🕐 Time</span>
            <span class="detail-value">${event.time}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">🏫 College</span>
            <span class="detail-value">${event.college}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">💵 Registration Fee</span>
            <span class="detail-value">₹${event.fee}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">👥 Participants</span>
            <span class="detail-value">${event.registered} / ${event.maxParticipants}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">📊 Availability</span>
            <span class="detail-value">${event.maxParticipants - event.registered} slots left</span>
        </div>

        <div class="slots-bar" style="margin-top: 1.5rem;">
            <div class="slots-fill" style="width: ${slotsFilled}%"></div>
        </div>

        <div class="modal-actions">
            <button class="btn btn-secondary" onclick="closeModal()">Close</button>
            <button class="btn btn-primary" onclick="registerEvent(${event.id}, '${event.name}')">Register Now</button>
        </div>
    `;

    modal.style.display = 'block';
}

// Register Event
function registerEvent(eventId, eventName) {
    const event = eventsData.find(e => e.id === eventId);
    if (!event) return;

    if (event.registered >= event.maxParticipants) {
        showBanner('Sorry! This event is full. No more slots available.');
        return;
    }

    // Check if user is logged in (for demo purposes, we'll use localStorage)
    const user = localStorage.getItem('user');
    if (!user) {
        showBanner('Please login first to register for events.');
        scrollToLogin();
        return;
    }

    // Simulate registration
    event.registered += 1;
    showBanner(`Successfully registered for ${eventName}!\n\nA confirmation email will be sent to your registered email address.`);
    renderEvents();
    closeModal();
}

// Close Modal
function closeModal() {
    document.getElementById('eventModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('eventModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

// Switch Tab
function switchTab(tabId) {
    // Hide all forms
    const forms = document.querySelectorAll('.auth-form');
    forms.forEach(form => form.classList.remove('active-tab'));

    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Show selected form
    document.getElementById(tabId).classList.add('active-tab');

    // Add active class to clicked button
    event.target.classList.add('active');
}

// Setup Form Handlers
function setupFormHandlers() {
    // Login Form
    const loginForm = document.getElementById('login-tab');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // Simple validation
        if (email && password) {
            // Check if user exists in localStorage or create a temporary one
            const existingUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
            let user = existingUsers.find(u => u.email === email);
            
            if (!user) {
                // Default to participant if not found
                user = {
                    email: email,
                    role: 'participant'
                };
            }

            // Store current user
            localStorage.setItem('user', JSON.stringify(user));

            // Redirect based on role
            if (user.role === 'organizer') {
                window.location.href = 'organizer-dashboard.html';
            } else {
                window.location.href = 'participant-dashboard.html';
            }
        }
    });

    // Signup Form
    const signupForm = document.getElementById('signup-tab');
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const role = document.getElementById('signup-role').value;

        // Validation
        if (name && email && password && role) {
            if (password.length < 6) {
                showBanner('Password must be at least 6 characters long.');
                return;
            }

            // Store user data
            const userData = {
                name: name,
                email: email,
                password: password, // Note: In production, never store plain passwords
                role: role
            };

            // Save to users list
            const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
            const userExists = allUsers.find(u => u.email === email);
            
            if (userExists) {
                showBanner('Email already registered. Please login instead.');
                return;
            }

            allUsers.push(userData);
            localStorage.setItem('allUsers', JSON.stringify(allUsers));

            // Store current user
            localStorage.setItem('user', JSON.stringify(userData));

            // Redirect based on role
            if (role === 'organizer') {
                window.location.href = 'organizer-dashboard.html';
            } else {
                window.location.href = 'participant-dashboard.html';
            }
        }
    });
}

// Smooth Scroll Helpers
function scrollToLogin() {
    document.getElementById('login').scrollIntoView({ behavior: 'smooth' });
}

function scrollToEvents() {
    document.getElementById('events').scrollIntoView({ behavior: 'smooth' });
}

// Search and Filter Events (bonus feature)
function searchEvents(query) {
    const filtered = eventsData.filter(event =>
        event.name.toLowerCase().includes(query.toLowerCase()) ||
        event.college.toLowerCase().includes(query.toLowerCase()) ||
        event.category.toLowerCase().includes(query.toLowerCase())
    );

    const eventsGrid = document.getElementById('eventsGrid');
    eventsGrid.innerHTML = '';

    if (filtered.length === 0) {
        eventsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 2rem;">No events found matching your search.</p>';
        return;
    }

    filtered.forEach(event => {
        const eventCard = createEventCard(event);
        eventsGrid.appendChild(eventCard);
    });
}

// Filter Events by Category
function filterEventsByCategory(category) {
    if (category === 'all') {
        renderEvents();
        return;
    }

    const filtered = eventsData.filter(event => event.category === category);
    const eventsGrid = document.getElementById('eventsGrid');
    eventsGrid.innerHTML = '';

    filtered.forEach(event => {
        const eventCard = createEventCard(event);
        eventsGrid.appendChild(eventCard);
    });
}
