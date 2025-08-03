// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';
let internData = [];
let dashboardStats = null;

// API Helper Functions
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Dashboard Metrics Functions
async function loadDashboardMetrics() {
    const metricCards = document.getElementById('metricCards');
    
    // Show loading state
    metricCards.innerHTML = createLoadingCards();
    
    try {
        const response = await apiRequest('/dashboard/stats');
        dashboardStats = response.data;
        
        // Update metrics with real data
        metricCards.innerHTML = createMetricCards(dashboardStats.metrics, dashboardStats.trends);
        
    } catch (error) {
        console.error('Failed to load dashboard metrics:', error);
        metricCards.innerHTML = createErrorState('Failed to load dashboard metrics', 'loadDashboardMetrics');
    }
}

function createLoadingCards() {
    return `
        <div class="metric-card total-interns loading">
            <div class="loading">
                <div class="loading-spinner"></div>
                Loading metrics...
            </div>
        </div>
        <div class="metric-card active-applications loading">
            <div class="loading">
                <div class="loading-spinner"></div>
                Loading...
            </div>
        </div>
        <div class="metric-card interviews-scheduled loading">
            <div class="loading">
                <div class="loading-spinner"></div>
                Loading...
            </div>
        </div>
        <div class="metric-card hired-this-month loading">
            <div class="loading">
                <div class="loading-spinner"></div>
                Loading...
            </div>
        </div>
    `;
}

function createMetricCards(metrics, trends) {
    return `
        <div class="metric-card total-interns">
            <div class="metric-header">
                <div>
                    <div class="metric-title">Total Interns</div>
                    <div class="metric-value">${metrics.totalInterns}</div>
                    <div class="metric-change positive">
                        <span class="change-indicator">▲</span>
                        ${trends.growth.hiredChange} from last month
                    </div>
                </div>
                <div class="metric-icon">👥</div>
            </div>
        </div>

        <div class="metric-card active-applications">
            <div class="metric-header">
                <div>
                    <div class="metric-title">Active Applications</div>
                    <div class="metric-value">${metrics.activeApplications}</div>
                    <div class="metric-change positive">
                        <span class="change-indicator">▲</span>
                        ${trends.growth.applicationsChange} this week
                    </div>
                </div>
                <div class="metric-icon">📋</div>
            </div>
        </div>

        <div class="metric-card interviews-scheduled">
            <div class="metric-header">
                <div>
                    <div class="metric-title">Interviews Scheduled</div>
                    <div class="metric-value">${metrics.interviewsScheduled}</div>
                    <div class="metric-change neutral">
                        <span class="change-indicator">●</span>
                        This week
                    </div>
                </div>
                <div class="metric-icon">🗓️</div>
            </div>
        </div>

        <div class="metric-card hired-this-month">
            <div class="metric-header">
                <div>
                    <div class="metric-title">Hired This Month</div>
                    <div class="metric-value">${metrics.hiredThisMonth}</div>
                    <div class="metric-change positive">
                        <span class="change-indicator">▲</span>
                        +2 from target
                    </div>
                </div>
                <div class="metric-icon">✅</div>
            </div>
        </div>
    `;
}

// Intern Table Functions
async function loadInternData() {
    const tableBody = document.getElementById('internTableBody');
    
    // Show loading state
    showTableLoading();
    
    try {
        const response = await apiRequest('/interns');
        internData = response.data;
        originalRows = internData; // Update for filtering
        
        displayInternData(internData);
        
    } catch (error) {
        console.error('Failed to load intern data:', error);
        showTableError('Failed to load intern data', 'loadInternData');
    }
}

function showTableLoading() {
    const tableBody = document.getElementById('internTableBody');
    tableBody.innerHTML = `
        <tr>
            <td colspan="5" class="table-loading">
                <div class="loading">
                    <div class="loading-spinner"></div>
                    Loading intern data...
                </div>
            </td>
        </tr>
    `;
}

function showTableError(message, retryFn) {
    const tableBody = document.getElementById('internTableBody');
    tableBody.innerHTML = `
        <tr>
            <td colspan="5">
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <div>${message}</div>
                    <button class="retry-btn" onclick="${retryFn}()">Retry</button>
                </div>
            </td>
        </tr>
    `;
}

function displayInternData(interns) {
    const tableBody = document.getElementById('internTableBody');
    
    if (interns.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <div>No interns found</div>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = interns.map(intern => `
        <tr data-intern-id="${intern.id}" data-name="${intern.firstName} ${intern.lastName}" data-email="${intern.email}" data-status="${intern.status}" data-department="${intern.department}" data-start-date="${intern.startDate}" data-phone="${intern.phone || 'N/A'}">
            <td>${intern.firstName} ${intern.lastName}</td>
            <td>${intern.email}</td>
            <td><span class="status-badge status-${intern.status.toLowerCase()}">${intern.status}</span></td>
            <td>${intern.department}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary view-btn" onclick="showInternDetailsById('${intern.id}')">👁️ View</button>
                    <button class="btn btn-secondary" onclick="editIntern('${intern.id}')">✏️ Edit</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Enhanced intern details with API data
async function showInternDetailsById(internId) {
    try {
        const response = await apiRequest(`/interns/${internId}`);
        const intern = response.data;
        
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <div class="intern-detail">
                <label>Full Name</label>
                <value>${intern.fullName}</value>
            </div>
            <div class="intern-detail">
                <label>Email Address</label>
                <value>${intern.email}</value>
            </div>
            <div class="intern-detail">
                <label>Phone Number</label>
                <value>${intern.phone || 'N/A'}</value>
            </div>
            <div class="intern-detail">
                <label>Department</label>
                <value>${intern.department}</value>
            </div>
            <div class="intern-detail">
                <label>Status</label>
                <value><span class="status-badge status-${intern.status.toLowerCase()}">${intern.status}</span></value>
            </div>
            <div class="intern-detail">
                <label>University</label>
                <value>${intern.university || 'N/A'}</value>
            </div>
            <div class="intern-detail">
                <label>GPA</label>
                <value>${intern.gpa || 'N/A'}</value>
            </div>
            <div class="intern-detail">
                <label>Start Date</label>
                <value>${new Date(intern.startDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</value>
            </div>
            <div class="intern-detail">
                <label>Progress</label>
                <value>${intern.progressPercentage}% complete (${intern.daysSinceStart} days since start)</value>
            </div>
            <div class="intern-detail">
                <label>Skills</label>
                <value>${intern.skills ? intern.skills.join(', ') : 'N/A'}</value>
            </div>
            <div class="intern-detail">
                <label>Projects</label>
                <value>${intern.projects ? intern.projects.join(', ') : 'N/A'}</value>
            </div>
            <div class="intern-detail">
                <label>Notes</label>
                <value>${intern.notes || 'No notes available'}</value>
            </div>
        `;
        
        const modal = document.getElementById('internModal');
        modal.classList.add('show');
        
    } catch (error) {
        console.error('Failed to load intern details:', error);
        showNotification('Failed to load intern details. Please try again.', 'error');
    }
}

// Enhanced filtering with API data
async function filterTable() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const departmentFilter = document.getElementById('departmentFilter').value;
    
    try {
        // Show loading state while filtering
        showTableLoading();
        
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter) params.append('status', statusFilter);
        if (departmentFilter) params.append('department', departmentFilter);
        
        const queryString = params.toString();
        const endpoint = `/interns${queryString ? '?' + queryString : ''}`;
        
        const response = await apiRequest(endpoint);
        displayInternData(response.data);
        
        // Show results notification
        if (response.data.length === 0) {
            showNotification('No interns found matching your filters.', 'info', 3000);
        } else if (searchTerm || statusFilter || departmentFilter) {
            showNotification(`Found ${response.data.length} intern(s) matching your filters.`, 'success', 3000);
        }
        
    } catch (error) {
        console.error('Failed to filter intern data:', error);
        showTableError('Failed to filter data', 'loadInternData');
        showNotification('Failed to filter intern data. Please try again.', 'error');
    }
}

// Form submission with API
async function submitApplication() {
    const submitBtn = document.getElementById('submitBtn');
    const form = document.getElementById('applicationForm');
    const formData = new FormData(form);
    
    // Convert FormData to object
    const applicationData = {};
    for (let [key, value] of formData.entries()) {
        applicationData[key] = value;
    }
    
    // Handle skills array (if implemented)
    if (applicationData.skills) {
        applicationData.skills = applicationData.skills.split(',').map(s => s.trim()).filter(s => s);
    }
    
    try {
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⏳</span> Submitting...';
        
        const response = await apiRequest('/interns', {
            method: 'POST',
            body: JSON.stringify(applicationData)
        });
        
        if (response.success) {
            showNotification('Application submitted successfully! We will review your application and get back to you soon.', 'success');
            hideApplicationForm();
            
            // Reload intern data to show new application
            await loadInternData();
            await loadDashboardMetrics();
        } else {
            throw new Error(response.error || 'Failed to submit application');
        }
        
    } catch (error) {
        console.error('Failed to submit application:', error);
        
        if (error.message.includes('Validation failed')) {
            showNotification('Please check your form data and try again.', 'error');
        } else if (error.message.includes('email already exists')) {
            showNotification('An application with this email address already exists.', 'error');
        } else {
            showNotification('Failed to submit application. Please try again.', 'error');
        }
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>📤</span> Submit Application';
    }
}

function createErrorState(message, retryFunction) {
    return `
        <div class="error-state">
            <div class="error-icon">⚠️</div>
            <div>${message}</div>
            <button class="retry-btn" onclick="${retryFunction}()">Retry</button>
        </div>
    `;
}

// Notification System Functions
function showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="closeNotification(this)">×</button>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Auto-remove after duration
    setTimeout(() => {
        if (notification.parentNode) {
            closeNotification(notification.querySelector('.notification-close'));
        }
    }, duration);
}

function getNotificationIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || icons.info;
}

function closeNotification(button) {
    const notification = button.closest('.notification');
    if (notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

function showConfirmDialog(message, onConfirm, onCancel) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
        <div class="confirm-dialog">
            <div class="confirm-icon">⚠️</div>
            <div class="confirm-message">${message}</div>
            <div class="confirm-buttons">
                <button class="btn btn-danger confirm-yes">Yes, Delete</button>
                <button class="btn btn-secondary confirm-no">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    overlay.querySelector('.confirm-yes').onclick = () => {
        document.body.removeChild(overlay);
        if (onConfirm) onConfirm();
    };
    
    overlay.querySelector('.confirm-no').onclick = () => {
        document.body.removeChild(overlay);
        if (onCancel) onCancel();
    };
    
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
            if (onCancel) onCancel();
        }
    };
}

// Enhanced edit intern function with actual functionality
async function editIntern(internId) {
    try {
        const response = await apiRequest(`/interns/${internId}`);
        const intern = response.data;
        
        // Create edit form modal
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <form id="editInternForm" class="edit-intern-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="editFirstName">First Name</label>
                        <input type="text" id="editFirstName" name="firstName" value="${intern.firstName}" required>
                    </div>
                    <div class="form-group">
                        <label for="editLastName">Last Name</label>
                        <input type="text" id="editLastName" name="lastName" value="${intern.lastName}" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="editEmail">Email</label>
                        <input type="email" id="editEmail" name="email" value="${intern.email}" required>
                    </div>
                    <div class="form-group">
                        <label for="editPhone">Phone</label>
                        <input type="tel" id="editPhone" name="phone" value="${intern.phone || ''}">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="editDepartment">Department</label>
                        <select id="editDepartment" name="department" required>
                            <option value="Engineering" ${intern.department === 'Engineering' ? 'selected' : ''}>Engineering</option>
                            <option value="Marketing" ${intern.department === 'Marketing' ? 'selected' : ''}>Marketing</option>
                            <option value="Design" ${intern.department === 'Design' ? 'selected' : ''}>Design</option>
                            <option value="Data Science" ${intern.department === 'Data Science' ? 'selected' : ''}>Data Science</option>
                            <option value="HR" ${intern.department === 'HR' ? 'selected' : ''}>HR</option>
                            <option value="Finance" ${intern.department === 'Finance' ? 'selected' : ''}>Finance</option>
                            <option value="Operations" ${intern.department === 'Operations' ? 'selected' : ''}>Operations</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editStatus">Status</label>
                        <select id="editStatus" name="status" required>
                            <option value="Pending" ${intern.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Active" ${intern.status === 'Active' ? 'selected' : ''}>Active</option>
                            <option value="Completed" ${intern.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="editUniversity">University</label>
                        <input type="text" id="editUniversity" name="university" value="${intern.university || ''}">
                    </div>
                    <div class="form-group">
                        <label for="editGpa">GPA</label>
                        <input type="number" id="editGpa" name="gpa" min="0" max="4" step="0.01" value="${intern.gpa || ''}">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="editNotes">Notes</label>
                    <textarea id="editNotes" name="notes" rows="3">${intern.notes || ''}</textarea>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        <span>💾</span> Update Intern
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">
                        Cancel
                    </button>
                    <button type="button" class="btn btn-danger" onclick="deleteInternWithConfirm('${internId}')">
                        <span>🗑️</span> Delete
                    </button>
                </div>
            </form>
        `;
        
        // Show modal
        const modal = document.getElementById('internModal');
        modal.classList.add('show');
        
        // Add form submit handler
        document.getElementById('editInternForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await updateIntern(internId, new FormData(e.target));
        });
        
    } catch (error) {
        console.error('Failed to load intern for editing:', error);
        showNotification('Failed to load intern details for editing. Please try again.', 'error');
    }
}

// Update intern function
async function updateIntern(internId, formData) {
    const submitBtn = document.querySelector('#editInternForm button[type="submit"]');
    
    try {
        // Convert FormData to object
        const updateData = {};
        for (let [key, value] of formData.entries()) {
            if (value.trim() !== '') {
                updateData[key] = value;
            }
        }
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⏳</span> Updating...';
        
        const response = await apiRequest(`/interns/${internId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
        
        if (response.success) {
            showNotification(`Successfully updated ${response.data.firstName} ${response.data.lastName}`, 'success');
            closeModal();
            
            // Reload data
            await loadInternData();
            await loadDashboardMetrics();
        } else {
            throw new Error(response.error || 'Failed to update intern');
        }
        
    } catch (error) {
        console.error('Failed to update intern:', error);
        
        if (error.message.includes('email already exists')) {
            showNotification('Another intern with this email address already exists.', 'error');
        } else if (error.message.includes('Validation failed')) {
            showNotification('Please check your form data and try again.', 'error');
        } else {
            showNotification('Failed to update intern. Please try again.', 'error');
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>💾</span> Update Intern';
    }
}

// Delete intern with confirmation
async function deleteInternWithConfirm(internId) {
    try {
        const response = await apiRequest(`/interns/${internId}`);
        const intern = response.data;
        
        showConfirmDialog(
            `Are you sure you want to delete ${intern.firstName} ${intern.lastName}? This action cannot be undone.`,
            async () => {
                await deleteIntern(internId);
            }
        );
        
    } catch (error) {
        console.error('Failed to load intern for deletion:', error);
        showNotification('Failed to load intern details. Please try again.', 'error');
    }
}

// Delete intern function
async function deleteIntern(internId) {
    try {
        const response = await apiRequest(`/interns/${internId}?confirm=true`, {
            method: 'DELETE'
        });
        
        if (response.success) {
            showNotification(`Successfully deleted intern`, 'success');
            closeModal();
            
            // Reload data
            await loadInternData();
            await loadDashboardMetrics();
        } else {
            throw new Error(response.error || 'Failed to delete intern');
        }
        
    } catch (error) {
        console.error('Failed to delete intern:', error);
        
        if (error.message.includes('Cannot delete active intern')) {
            showNotification('Cannot delete active intern. Please change status to Completed first.', 'warning');
        } else {
            showNotification('Failed to delete intern. Please try again.', 'error');
        }
    }
}

// Initialize data loading when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Load initial data
    loadDashboardMetrics();
    loadInternData();
    
    // Override the existing form submission
    const applicationForm = document.getElementById('applicationForm');
    if (applicationForm) {
        applicationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitApplication();
        });
    }
    
    // Override the existing filter functions
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const departmentFilter = document.getElementById('departmentFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterTable);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', filterTable);
    }
    if (departmentFilter) {
        departmentFilter.addEventListener('change', filterTable);
    }
});