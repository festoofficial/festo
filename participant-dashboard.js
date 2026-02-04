// Participant Dashboard Script

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


// Sample Events Data for Participant
const allEvents = [
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
        description: 'Join industry leaders for an exciting tech summit.'
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
        description: 'Celebrate diversity with music, dance, and performances.'
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
        description: 'A 24-hour hackathon with amazing prizes!'
    },
    {
        id: 4,
        name: 'Tech Workshop',
        college: 'MIT College',
        category: 'Technology',
        date: '2026-01-28',
        time: '02:00 PM',
        venue: 'Lab Building',
        fee: 300,
        maxParticipants: 50,
        registered: 45,
        description: 'Learn latest web development technologies.'
    }
];

const registeredEvents = [
    { id: 1, name: 'Annual Tech Summit', date: '2026-02-15', status: 'Confirmed', paymentStatus: 'Paid', registrationDate: '2026-01-20' },
    { id: 3, name: 'Hackathon 2026', date: '2026-03-01', status: 'Confirmed', paymentStatus: 'Pending', registrationDate: '2026-01-18' }
];

const completedEvents = [
    { id: 5, name: 'Spring Tech Talk', date: '2026-01-15', position: 'Winner', status: 'Completed' },
    { id: 6, name: 'Last Year Summit', date: '2025-12-10', position: 'Participant', status: 'Completed' }
];

const certificates = [
    {
        id: 1,
        title: 'Participation Certificate',
        event: 'Spring Tech Talk',
        date: '2026-01-15',
        certificateId: 'CERT-2026-001'
    },
    {
        id: 2,
        title: 'Winner Certificate',
        event: 'Web Development Challenge',
        date: '2025-12-20',
        certificateId: 'CERT-2025-045'
    }
];

// Initialize Participant Dashboard
document.addEventListener('DOMContentLoaded', () => {
    updateParticipantStats();
    setupFormHandlers();
    displayUserEmail();
    renderDiscoverEvents();
    renderUpcomingEvents();
    renderRegisteredEvents();
    renderEventHistory();
    renderCertificates();
});

// Update Dashboard Stats
function updateParticipantStats() {
    const upcomingCount = registeredEvents.filter(e => new Date(e.date) > new Date()).length;
    const completedCount = completedEvents.length;
    const winsCount = completedEvents.filter(e => e.position === 'Winner').length;
    const certificatesCount = certificates.length;

    document.getElementById('upcomingCount').textContent = upcomingCount;
    document.getElementById('completedCount').textContent = completedCount;
    document.getElementById('winsCount').textContent = winsCount;
    document.getElementById('certificatesCount').textContent = certificatesCount;
}

// Render Upcoming Events for User
function renderUpcomingEvents() {
    const list = document.getElementById('upcomingList');
    list.innerHTML = '';

    if (registeredEvents.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">No upcoming events. Register for events to get started!</p>';
        return;
    }

    registeredEvents.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event-item';
        eventDiv.innerHTML = `
            <div class="event-item-info">
                <div class="event-item-title">${event.name}</div>
                <div class="event-item-details">
                    📅 ${formatDate(event.date)} | 🏷️ ${event.status} | 💳 ${event.paymentStatus}
                </div>
            </div>
            <div class="event-item-actions">
                <button class="btn btn-secondary" onclick="viewEventDetail(${event.id})">View</button>
                <button class="btn btn-primary" onclick="downloadTicket(${event.id})">🎫 Ticket</button>
            </div>
        `;
        list.appendChild(eventDiv);
    });
}

// Render Registered Events
function renderRegisteredEvents() {
    const list = document.getElementById('registeredList');
    list.innerHTML = '';

    if (registeredEvents.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">You haven\'t registered for any events yet.</p>';
        return;
    }

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Event Name</th>
                    <th>Date</th>
                    <th>Registration Date</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    registeredEvents.forEach(event => {
        const statusColor = event.status === 'Confirmed' ? '#10b981' : '#f59e0b';
        const paymentColor = event.paymentStatus === 'Paid' ? '#10b981' : '#ef4444';
        
        tableHTML += `
            <tr>
                <td><strong>${event.name}</strong></td>
                <td>${formatDate(event.date)}</td>
                <td>${formatDate(event.registrationDate)}</td>
                <td><span style="color: ${statusColor}; font-weight: 600;">${event.status}</span></td>
                <td><span style="color: ${paymentColor}; font-weight: 600;">${event.paymentStatus}</span></td>
                <td>
                    <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" onclick="downloadTicket(${event.id})">Download</button>
                </td>
            </tr>
        `;
    });

    tableHTML += `</tbody></table>`;
    list.innerHTML = tableHTML;
}

// Render Discover Events
function renderDiscoverEvents() {
    const grid = document.getElementById('discoverGrid');
    grid.innerHTML = '';

    allEvents.forEach(event => {
        const isRegistered = registeredEvents.find(e => e.id === event.id);
        const slotsFilled = (event.registered / event.maxParticipants) * 100;
        
        const card = document.createElement('div');
        card.className = 'event-card';
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
                    <span class="slots-available">${event.maxParticipants - event.registered} slots available</span>
                </div>
                <div class="slots-bar">
                    <div class="slots-fill" style="width: ${slotsFilled}%"></div>
                </div>
                <div class="event-footer" style="margin-top: 1rem;">
                    <button class="btn btn-secondary" onclick="viewEventDetail(${event.id})">View Details</button>
                    ${isRegistered ? 
                        '<button class="btn btn-secondary" style="background-color: #10b981; border-color: #10b981; color: white;">✓ Registered</button>' 
                        : `<button class="btn btn-primary" onclick="registerForEvent(${event.id}, '${event.name}')">Register</button>`
                    }
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Search Events
function searchEvents() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const grid = document.getElementById('discoverGrid');
    grid.innerHTML = '';

    const filtered = allEvents.filter(event =>
        event.name.toLowerCase().includes(query) ||
        event.college.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #64748b;">No events found matching your search.</p>';
        return;
    }

    filtered.forEach(event => {
        const isRegistered = registeredEvents.find(e => e.id === event.id);
        const slotsFilled = (event.registered / event.maxParticipants) * 100;
        
        const card = document.createElement('div');
        card.className = 'event-card';
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
                    <span class="slots-available">${event.maxParticipants - event.registered} slots available</span>
                </div>
                <div class="slots-bar">
                    <div class="slots-fill" style="width: ${slotsFilled}%"></div>
                </div>
                <div class="event-footer" style="margin-top: 1rem;">
                    <button class="btn btn-secondary" onclick="viewEventDetail(${event.id})">View Details</button>
                    ${isRegistered ? 
                        '<button class="btn btn-secondary" style="background-color: #10b981; border-color: #10b981; color: white;">✓ Registered</button>' 
                        : `<button class="btn btn-primary" onclick="registerForEvent(${event.id}, '${event.name}')">Register</button>`
                    }
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Filter by Category
function filterByCategory() {
    const category = document.getElementById('categoryFilter').value;
    const grid = document.getElementById('discoverGrid');
    grid.innerHTML = '';

    const filtered = category === '' ? allEvents : allEvents.filter(e => e.category === category);

    filtered.forEach(event => {
        const isRegistered = registeredEvents.find(e => e.id === event.id);
        const slotsFilled = (event.registered / event.maxParticipants) * 100;
        
        const card = document.createElement('div');
        card.className = 'event-card';
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
                    <span class="slots-available">${event.maxParticipants - event.registered} slots available</span>
                </div>
                <div class="slots-bar">
                    <div class="slots-fill" style="width: ${slotsFilled}%"></div>
                </div>
                <div class="event-footer" style="margin-top: 1rem;">
                    <button class="btn btn-secondary" onclick="viewEventDetail(${event.id})">View Details</button>
                    ${isRegistered ? 
                        '<button class="btn btn-secondary" style="background-color: #10b981; border-color: #10b981; color: white;">✓ Registered</button>' 
                        : `<button class="btn btn-primary" onclick="registerForEvent(${event.id}, '${event.name}')">Register</button>`
                    }
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Render Event History
function renderEventHistory() {
    const list = document.getElementById('historyList');
    list.innerHTML = '';

    completedEvents.forEach(event => {
        const timelineDiv = document.createElement('div');
        timelineDiv.className = 'timeline-item';
        const icon = event.position === 'Winner' ? '🏆' : '✅';
        timelineDiv.innerHTML = `
            <div class="timeline-marker">${icon}</div>
            <div class="timeline-content">
                <h4>${event.name}</h4>
                <p>${event.position} • ${formatDate(event.date)}</p>
            </div>
        `;
        list.appendChild(timelineDiv);
    });
}

// Render Certificates
function renderCertificates() {
    const grid = document.getElementById('certificatesList');
    grid.innerHTML = '';

    if (certificates.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem; grid-column: 1 / -1;">No certificates yet. Complete events to earn certificates!</p>';
        return;
    }

    certificates.forEach(cert => {
        const card = document.createElement('div');
        card.className = 'certificate-card';
        card.innerHTML = `
            <div class="certificate-content">
                <div class="certificate-title">${cert.title}</div>
                <div class="certificate-event">${cert.event}</div>
                <div class="certificate-date">${formatDate(cert.date)}</div>
                <div class="certificate-actions">
                    <button onclick="downloadCertificate('${cert.certificateId}')">📥 Download</button>
                    <button onclick="shareCertificate('${cert.certificateId}')">📤 Share</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Register for Event
function registerForEvent(eventId, eventName) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;

    if (event.registered >= event.maxParticipants) {
        showBanner('Sorry! This event is full.');
        return;
    }

    showBanner(`Successfully registered for ${eventName}!\n\nProceed to payment to confirm your registration.`);
    registeredEvents.push({
        id: eventId,
        name: eventName,
        date: event.date,
        status: 'Pending Payment',
        paymentStatus: 'Pending',
        registrationDate: new Date().toISOString().split('T')[0]
    });

    renderDiscoverEvents();
    renderUpcomingEvents();
    renderRegisteredEvents();
    updateParticipantStats();
}

// View Event Detail
function viewEventDetail(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;

    const slotsFilled = (event.registered / event.maxParticipants) * 100;
    
    showBanner(`${event.name}\n\nDate: ${formatDate(event.date)}\nTime: ${event.time}\nVenue: ${event.venue}\nFee: ₹${event.fee}\n\nParticipants: ${event.registered}/${event.maxParticipants}`);
}

// Download Ticket
function downloadTicket(eventId) {
    const event = registeredEvents.find(e => e.id === eventId);
    if (!event) return;
    showBanner(`Downloading ticket for ${event.name}...`);
}

// Download Certificate
function downloadCertificate(certificateId) {
    showBanner(`Downloading certificate ${certificateId}...`);
}

// Share Certificate
function shareCertificate(certificateId) {
    showBanner(`Sharing certificate ${certificateId} on social media...`);
}

// Format Date
function formatDate(dateString) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

// Switch Dashboard Tab
function switchDashboardTab(event, tabId) {
    if (event) {
        event.preventDefault();
    }

    // Hide all tabs
    const tabs = document.querySelectorAll('.dashboard-tab');
    tabs.forEach(tab => tab.classList.remove('active-tab'));

    // Remove active class from navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    // Show selected tab
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active-tab');
    }

    // Add active class to clicked nav item
    if (event && event.target.closest('.nav-item')) {
        event.target.closest('.nav-item').classList.add('active');
    } else {
        document.querySelector(`a[href="#${tabId}"]`)?.classList.add('active');
    }
}

// Setup Form Handlers
function setupFormHandlers() {
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showBanner('Profile updated successfully!');
        });
    }
}

// Display User Email
function displayUserEmail() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const emailSpan = document.getElementById('userEmail');
    if (user.email) {
        emailSpan.textContent = user.email;
    }
}

// Logout
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}
