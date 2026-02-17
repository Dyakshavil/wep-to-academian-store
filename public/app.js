// Shared utility functions for the application

// Format date to Arabic locale
function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format date and time
function formatDateTime(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show loading spinner
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="spinner"></div>';
    }
}

// Show error message
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<p class="text-center text-secondary">❌ ${message}</p>`;
    }
}

// Validate email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// API helper function
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(endpoint, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        return await response.json();
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

// Service type translations
const SERVICE_TYPES = {
    'research': '📚 بحث علمي',
    'presentation': '📊 عرض تقديمي',
    'programming': '💻 مشروع برمجي',
    'software': '🖥️ تطوير برمجيات',
    'custom': '✨ طلب خاص'
};

// Status translations
const STATUS_TYPES = {
    'pending': 'جديد - قيد المراجعة',
    'in_progress': 'جاري العمل عليه',
    'completed': 'مكتمل'
};

// Get service name in Arabic
function getServiceName(serviceType) {
    return SERVICE_TYPES[serviceType] || serviceType;
}

// Get status name in Arabic
function getStatusName(status) {
    return STATUS_TYPES[status] || status;
}

// Add fade-in animation to elements
function addFadeInAnimation(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('fade-in');
        }, index * 100);
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Add fade-in animations
    addFadeInAnimation('.fade-in');

    // Set minimum date for date inputs to today
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    dateInputs.forEach(input => {
        if (!input.hasAttribute('min')) {
            input.min = today;
        }
    });
});
