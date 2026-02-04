export const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
};

export const scrollToLogin = () => {
    const element = document.getElementById('login-section');
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
};

export const scrollToEvents = () => {
    const element = document.getElementById('events-section');
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
};

export const searchEvents = (eventsData, query) => {
    return eventsData.filter(event =>
        event.name.toLowerCase().includes(query.toLowerCase()) ||
        event.college.toLowerCase().includes(query.toLowerCase()) ||
        event.category.toLowerCase().includes(query.toLowerCase())
    );
};

export const filterEventsByCategory = (eventsData, category) => {
    if (category === 'all' || category === '') {
        return eventsData;
    }
    return eventsData.filter(event => event.category === category);
};

export const exportToCSV = (data, filename = 'export.csv') => {
    let csv = Object.keys(data[0]).join(',') + '\n';
    csv += data.map(row => Object.values(row).map(val => `"${val}"`).join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
};
