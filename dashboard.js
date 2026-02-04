// Organizer Dashboard Script

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


// Sample Events Data
const organizerEvents = [
    {
        id: 1,
        name: 'Annual Tech Summit',
        category: 'Technology',
        date: '2026-02-15',
        time: '10:00 AM',
        venue: 'Main Auditorium',
        fee: 500,
        maxParticipants: 200,
        registered: 150,
        revenue: 75000
    },
    {
        id: 2,
        name: 'Tech Workshop',
        category: 'Technology',
        date: '2026-01-28',
        time: '02:00 PM',
        venue: 'Lab Building',
        fee: 300,
        maxParticipants: 50,
        registered: 45,
        revenue: 13500
    }
];

const participants = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', event: 'Annual Tech Summit', date: '2026-02-01', status: 'Paid' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', event: 'Annual Tech Summit', date: '2026-02-02', status: 'Pending' },
    { id: 3, name: 'Carol White', email: 'carol@example.com', event: 'Tech Workshop', date: '2026-01-25', status: 'Paid' },
    { id: 4, name: 'David Brown', email: 'david@example.com', event: 'Annual Tech Summit', date: '2026-02-03', status: 'Paid' },
    { id: 5, name: 'Emma Davis', email: 'emma@example.com', event: 'Tech Workshop', date: '2026-01-26', status: 'Paid' },
];

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    updateDashboardStats();
    populateEventFilter();
    renderRecentEvents();
    setupFormHandlers();
    displayUserEmail();
});

// Update Dashboard Stats
function updateDashboardStats() {
    const totalEvents = organizerEvents.length;
    const totalParticipants = participants.length;
    const totalRevenue = organizerEvents.reduce((sum, event) => sum + event.revenue, 0);
    const upcomingEvents = organizerEvents.filter(event => new Date(event.date) > new Date()).length;

    document.getElementById('totalEvents').textContent = totalEvents;
    document.getElementById('totalRegistrations').textContent = totalParticipants;
    document.getElementById('totalRevenue').textContent = '₹' + totalRevenue.toLocaleString('en-IN');
    document.getElementById('upcomingEvents').textContent = upcomingEvents;

    // Revenue Tab
    document.getElementById('totalRevenueAmount').textContent = '₹' + totalRevenue.toLocaleString('en-IN');
    document.getElementById('avgRevenue').textContent = '₹' + Math.round(totalRevenue / totalEvents).toLocaleString('en-IN');
    
    const thisMonthRevenue = organizerEvents.filter(event => {
        const eventDate = new Date(event.date);
        const today = new Date();
        return eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear();
    }).reduce((sum, event) => sum + event.revenue, 0);
    
    document.getElementById('monthRevenue').textContent = '₹' + thisMonthRevenue.toLocaleString('en-IN');
}

// Render Recent Events
function renderRecentEvents() {
    const list = document.getElementById('recentEventsList');
    list.innerHTML = '';

    organizerEvents.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event-item';
        eventDiv.innerHTML = `
            <div class="event-item-info">
                <div class="event-item-title">${event.name}</div>
                <div class="event-item-details">
                    📅 ${formatDate(event.date)} | 👥 ${event.registered}/${event.maxParticipants} | 💰 ₹${event.revenue}
                </div>
            </div>
            <div class="event-item-actions">
                <button class="btn btn-secondary" onclick="editEvent(${event.id})">Edit</button>
                <button class="btn btn-secondary" onclick="viewParticipants(${event.id})">View</button>
            </div>
        `;
        list.appendChild(eventDiv);
    });
}

// Display My Events
function displayMyEvents() {
    const list = document.getElementById('myEventsList');
    
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Event Name</th>
                    <th>Date</th>
                    <th>Participants</th>
                    <th>Revenue</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    organizerEvents.forEach(event => {
        const status = new Date(event.date) > new Date() ? 'Upcoming' : 'Completed';
        const statusColor = status === 'Upcoming' ? '#10b981' : '#64748b';
        
        tableHTML += `
            <tr>
                <td><strong>${event.name}</strong></td>
                <td>${formatDate(event.date)}</td>
                <td>${event.registered}/${event.maxParticipants}</td>
                <td>₹${event.revenue}</td>
                <td><span style="color: ${statusColor}; font-weight: 600;">${status}</span></td>
                <td style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" onclick="editEvent(${event.id})">Edit</button>
                    <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.85rem; background-color: #ef4444; border-color: #ef4444; color: white;" onclick="deleteEvent(${event.id}, '${event.name}')">Delete</button>
                </td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;
    
    list.innerHTML = tableHTML;
}

// Display Participants List
function displayParticipantsList() {
    const list = document.getElementById('participantsList');
    
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Event</th>
                    <th>Registration Date</th>
                    <th>Payment Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    participants.forEach((p, index) => {
        const statusColor = p.status === 'Paid' ? '#10b981' : '#f59e0b';
        
        tableHTML += `
            <tr>
                <td><strong>${p.name}</strong></td>
                <td>${p.email}</td>
                <td>${p.event}</td>
                <td>${formatDate(p.date)}</td>
                <td><span style="color: ${statusColor}; font-weight: 600;">${p.status}</span></td>
                <td style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" onclick="sendEmail('${p.email}')">Email</button>
                    <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.85rem; background-color: #ef4444; border-color: #ef4444; color: white;" onclick="deleteParticipant(${index}, '${p.name}')">Remove</button>
                </td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;
    
    list.innerHTML = tableHTML;
}

// Display Revenue Breakdown
function displayRevenueBreakdown() {
    const list = document.getElementById('revenueList');
    list.innerHTML = '<h3>Revenue by Event</h3>';

    organizerEvents.forEach(event => {
        const revDiv = document.createElement('div');
        revDiv.className = 'revenue-item';
        revDiv.innerHTML = `
            <span class="revenue-item-name">${event.name}</span>
            <span class="revenue-item-amount">₹${event.revenue}</span>
        `;
        list.appendChild(revDiv);
    });
}

// Populate Event Filter
function populateEventFilter() {
    const filter = document.getElementById('eventFilter');
    organizerEvents.forEach(event => {
        const option = document.createElement('option');
        option.value = event.id;
        option.textContent = event.name;
        filter.appendChild(option);
    });
}

// Filter Participants
function filterParticipants() {
    const selectedEventId = document.getElementById('eventFilter').value;
    const list = document.getElementById('participantsList');

    let filtered = participants;
    if (selectedEventId) {
        const event = organizerEvents.find(e => e.id == selectedEventId);
        filtered = participants.filter(p => p.event === event.name);
    }

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Event</th>
                    <th>Registration Date</th>
                    <th>Payment Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    filtered.forEach((p, index) => {
        const statusColor = p.status === 'Paid' ? '#10b981' : '#f59e0b';
        const originalIndex = participants.findIndex(participant => participant.email === p.email);
        
        tableHTML += `
            <tr>
                <td><strong>${p.name}</strong></td>
                <td>${p.email}</td>
                <td>${p.event}</td>
                <td>${formatDate(p.date)}</td>
                <td><span style="color: ${statusColor}; font-weight: 600;">${p.status}</span></td>
                <td style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" onclick="sendEmail('${p.email}')">Email</button>
                    <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.85rem; background-color: #ef4444; border-color: #ef4444; color: white;" onclick="deleteParticipant(${originalIndex}, '${p.name}')">Remove</button>
                </td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;
    
    list.innerHTML = tableHTML;
}

// Export Participants as CSV
function exportParticipants() {
    const selectedEventId = document.getElementById('eventFilter').value;
    let filtered = participants;
    
    if (selectedEventId) {
        const event = organizerEvents.find(e => e.id == selectedEventId);
        filtered = participants.filter(p => p.event === event.name);
    }

    let csv = 'Name,Email,Event,Registration Date,Payment Status\n';
    filtered.forEach(p => {
        csv += `"${p.name}","${p.email}","${p.event}","${p.date}","${p.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'participants.csv';
    a.click();
}

// Edit Event
function editEvent(eventId) {
    const event = organizerEvents.find(e => e.id === eventId);
    if (!event) return;

    document.getElementById('eventName').value = event.name;
    document.getElementById('eventCategory').value = event.category;
    document.getElementById('eventDescription').value = `Event: ${event.name}`;
    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventTime').value = event.time;
    document.getElementById('eventVenue').value = event.venue;
    document.getElementById('eventFee').value = event.fee;
    document.getElementById('maxParticipants').value = event.maxParticipants;

    switchDashboardTab(null, 'create-event');
}

// Delete Event
function deleteEvent(eventId, eventName) {
    const confirmed = confirm(`Are you sure you want to delete "${eventName}"?\n\nThis action cannot be undone.`);
    
    if (confirmed) {
        const eventIndex = organizerEvents.findIndex(e => e.id === eventId);
        if (eventIndex > -1) {
            organizerEvents.splice(eventIndex, 1);
            
            // Remove all participants for this event
            const initialParticipantCount = participants.length;
            for (let i = participants.length - 1; i >= 0; i--) {
                if (participants[i].event === eventName) {
                    participants.splice(i, 1);
                }
            }
            const removedParticipants = initialParticipantCount - participants.length;
            
            showBanner(`Event "${eventName}" has been deleted successfully.\n(${removedParticipants} participant(s) removed)`);
            updateDashboardStats();
            renderRecentEvents();
            displayMyEvents();
            displayParticipantsList();
        }
    }
}

// Send Email to Participant
function sendEmail(email) {
    showBanner(`Email notification sent to ${email}`);
}

// Delete Participant
function deleteParticipant(participantIndex, participantName) {
    const confirmed = confirm(`Are you sure you want to remove "${participantName}" from this event?\n\nThis action cannot be undone.`);
    
    if (confirmed) {
        if (participantIndex > -1 && participantIndex < participants.length) {
            const participant = participants[participantIndex];
            participants.splice(participantIndex, 1);
            showBanner(`Participant "${participantName}" has been removed successfully.`);
            updateDashboardStats();
            displayParticipantsList();
        }
    }
}

// Setup Form Handlers
function setupFormHandlers() {
    const createEventForm = document.getElementById('createEventForm');
    if (createEventForm) {
        createEventForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const eventData = {
                id: organizerEvents.length + 1,
                name: document.getElementById('eventName').value,
                category: document.getElementById('eventCategory').value,
                date: document.getElementById('eventDate').value,
                time: document.getElementById('eventTime').value,
                venue: document.getElementById('eventVenue').value,
                fee: parseInt(document.getElementById('eventFee').value),
                maxParticipants: parseInt(document.getElementById('maxParticipants').value),
                registered: 0,
                revenue: 0
            };

            organizerEvents.push(eventData);
            showBanner('Event created successfully!');
            this.reset();
            updateDashboardStats();
            renderRecentEvents();
        });
    }

    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showBanner('Profile updated successfully!');
        });
    }
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

    // Load specific content
    if (tabId === 'events') {
        displayMyEvents();
    } else if (tabId === 'participants') {
        displayParticipantsList();
    } else if (tabId === 'revenue') {
        displayRevenueBreakdown();
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

// View Participants for Event
function viewParticipants(eventId) {
    document.getElementById('eventFilter').value = eventId;
    filterParticipants();
    switchDashboardTab(null, 'participants');
}
