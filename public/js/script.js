const API_BASE = 'http://localhost:3000/api';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadInventory();
    loadTracking();
    loadUserSelect();
    loadToolSelect();
    loadRatingToolSelect();
    setDefaultDates();
});

// ============ SECTION NAVIGATION ============
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Reload data if needed
    if (sectionId === 'calendar') {
        updateCalendar();
    } else if (sectionId === 'ratings') {
        loadRatings();
    }
}

// ============ INVENTORY SECTION ============
async function loadInventory() {
    try {
        const response = await fetch(`${API_BASE}/tools`);
        const tools = await response.json();
        
        const table = document.getElementById('inventoryTable');
        table.innerHTML = tools.map(tool => `
            <tr>
                <td>${tool.tool_id}</td>
                <td>${tool.name}</td>
                <td>${tool.description || 'N/A'}</td>
                <td>${tool.category}</td>
                <td>
                    <span class="status-badge ${tool.quantity_available > 0 ? 'badge-available' : 'badge-unavailable'}">
                        ${tool.quantity_available}
                    </span>
                </td>
                <td>${tool.location}</td>
                <td>
                    <button onclick="editTool(${tool.tool_id})" class="btn btn-primary btn-small">Edit</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading inventory:', error);
        document.getElementById('inventoryTable').innerHTML = '<tr><td colspan="7">Error loading inventory</td></tr>';
    }
}

function openAddToolModal() {
    document.getElementById('addToolModal').classList.add('active');
}

async function saveTool(e) {
    e.preventDefault();
    
    const tool = {
        name: document.getElementById('toolName').value,
        description: document.getElementById('toolDescription').value,
        category: document.getElementById('toolCategory').value,
        quantity_available: parseInt(document.getElementById('toolQuantity').value),
        location: document.getElementById('toolLocation').value
    };

    try {
        const response = await fetch(`${API_BASE}/tools`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tool)
        });

        if (response.ok) {
            alert('Tool added successfully!');
            closeModal('addToolModal');
            document.querySelector('#addToolModal form').reset();
            loadInventory();
            loadToolSelect();
        } else {
            alert('Error adding tool');
        }
    } catch (error) {
        console.error('Error saving tool:', error);
        alert('Error saving tool');
    }
}

async function editTool(toolId) {
    try {
        const response = await fetch(`${API_BASE}/tools/${toolId}`);
        const tool = await response.json();
        
        document.getElementById('toolName').value = tool.name;
        document.getElementById('toolDescription').value = tool.description;
        document.getElementById('toolCategory').value = tool.category;
        document.getElementById('toolQuantity').value = tool.quantity_available;
        document.getElementById('toolLocation').value = tool.location;
        
        document.getElementById('addToolModal').classList.add('active');
    } catch (error) {
        console.error('Error loading tool:', error);
        alert('Error loading tool details');
    }
}

// ============ AVAILABILITY CALENDAR ============
async function loadToolSelect() {
    try {
        const response = await fetch(`${API_BASE}/tools`);
        const tools = await response.json();
        
        const selects = ['toolSelect', 'borrowToolId', 'ratingToolSelect'];
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                const current = select.value;
                select.innerHTML = '<option value="">Select a tool...</option>';
                select.innerHTML += tools.map(tool => 
                    `<option value="${tool.tool_id}">${tool.name} (${tool.quantity_available} available)</option>`
                ).join('');
                if (current) select.value = current;
            }
        });
    } catch (error) {
        console.error('Error loading tool select:', error);
    }
}

async function updateCalendar() {
    const toolId = document.getElementById('toolSelect').value;
    if (!toolId) {
        document.getElementById('calendarContainer').innerHTML = '<div class="calendar-placeholder">Select a tool to view availability</div>';
        document.getElementById('usageList').innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/tools/${toolId}/availability`);
        const data = await response.json();
        const tool = data.tool;
        const usages = data.usage_history;

        // Create simple availability display
        const calendarHtml = `
            <div style="padding: 1rem;">
                <h3>${tool.name}</h3>
                <p><strong>Available Quantity:</strong> ${tool.quantity_available}</p>
                <p><strong>Location:</strong> ${tool.location}</p>
                <p><strong>Category:</strong> ${tool.category}</p>
                <p><strong>Description:</strong> ${tool.description || 'N/A'}</p>
            </div>
        `;
        document.getElementById('calendarContainer').innerHTML = calendarHtml;

        // Display usage history
        const usageHtml = usages.map(usage => `
            <div class="usage-item">
                <div>
                    <strong>Date:</strong> ${usage.borrow_date} to ${usage.expected_return_date || 'Not set'}
                    <br><strong>Status:</strong> ${usage.status}
                </div>
                <span class="usage-status status-${usage.status}">${usage.status.toUpperCase()}</span>
            </div>
        `).join('');
        document.getElementById('usageList').innerHTML = usageHtml || '<div class="calendar-placeholder">No usage history</div>';
    } catch (error) {
        console.error('Error loading calendar:', error);
        document.getElementById('calendarContainer').innerHTML = '<div class="calendar-placeholder">Error loading availability data</div>';
    }
}

// ============ TRACKING SECTION ============
async function loadTracking() {
    try {
        const response = await fetch(`${API_BASE}/usage`);
        const usages = await response.json();
        
        const table = document.getElementById('trackingTable');
        table.innerHTML = usages.map(usage => `
            <tr>
                <td>${usage.user_name}</td>
                <td>${usage.tool_name}</td>
                <td>${usage.borrow_date}</td>
                <td>${usage.expected_return_date || '-'}</td>
                <td>${usage.return_date || '-'}</td>
                <td><span class="usage-status status-${usage.status}">${usage.status.toUpperCase()}</span></td>
                <td>
                    ${usage.status === 'borrowed' ? 
                        `<button onclick="openReturnModal(${usage.usage_id})" class="btn btn-success btn-small">Return</button>` :
                        '-'
                    }
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading tracking:', error);
        document.getElementById('trackingTable').innerHTML = '<tr><td colspan="7">Error loading data</td></tr>';
    }
}

async function loadUserSelect() {
    try {
        const response = await fetch(`${API_BASE}/users`);
        const users = await response.json();
        
        const select = document.getElementById('borrowUserId');
        select.innerHTML = '<option value="">Select User</option>';
        select.innerHTML += users.map(user => 
            `<option value="${user.user_id}">${user.name}</option>`
        ).join('');
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function openBorrowModal() {
    setDefaultDates();
    document.getElementById('borrowModal').classList.add('active');
}

function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const borrowDateInput = document.getElementById('borrowDate');
    const expectedReturnInput = document.getElementById('expectedReturnDate');
    
    if (borrowDateInput) borrowDateInput.value = today;
    if (expectedReturnInput) expectedReturnInput.value = nextWeek;
    
    const returnDateInput = document.getElementById('returnDate');
    if (returnDateInput) returnDateInput.value = today;
}

async function borrowTool(e) {
    e.preventDefault();
    
    const borrow = {
        user_id: parseInt(document.getElementById('borrowUserId').value),
        tool_id: parseInt(document.getElementById('borrowToolId').value),
        borrow_date: document.getElementById('borrowDate').value,
        expected_return_date: document.getElementById('expectedReturnDate').value
    };

    try {
        const response = await fetch(`${API_BASE}/usage/borrow`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(borrow)
        });

        if (response.ok) {
            alert('Tool borrowed successfully!');
            closeModal('borrowModal');
            document.querySelector('#borrowModal form').reset();
            loadTracking();
            loadToolSelect();
            loadInventory();
        } else {
            alert('Error borrowing tool');
        }
    } catch (error) {
        console.error('Error borrowing tool:', error);
        alert('Error borrowing tool');
    }
}

function openReturnModal(usageId) {
    document.getElementById('returnUsageId').value = usageId;
    setDefaultDates();
    document.getElementById('returnModal').classList.add('active');
}

async function returnTool(e) {
    e.preventDefault();
    
    const usageId = document.getElementById('returnUsageId').value;
    const returnData = {
        return_date: document.getElementById('returnDate').value,
        rating: parseInt(document.getElementById('toolRating').value),
        review: document.getElementById('toolReview').value
    };

    try {
        const response = await fetch(`${API_BASE}/usage/return/${usageId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(returnData)
        });

        if (response.ok) {
            alert('Tool returned successfully!');
            closeModal('returnModal');
            document.querySelector('#returnModal form').reset();
            loadTracking();
            loadToolSelect();
            loadInventory();
            loadRatings();
        } else {
            alert('Error returning tool');
        }
    } catch (error) {
        console.error('Error returning tool:', error);
        alert('Error returning tool');
    }
}

// ============ RATINGS SECTION ============
async function loadRatingToolSelect() {
    try {
        const response = await fetch(`${API_BASE}/tools`);
        const tools = await response.json();
        
        const select = document.getElementById('ratingToolSelect');
        select.innerHTML = '<option value="">All Tools</option>';
        select.innerHTML += tools.map(tool => 
            `<option value="${tool.tool_id}">${tool.name}</option>`
        ).join('');
    } catch (error) {
        console.error('Error loading tool select for ratings:', error);
    }
}

async function loadRatings() {
    const toolId = document.getElementById('ratingToolSelect').value;
    
    try {
        let url = `${API_BASE}/usage`;
        if (toolId) {
            url = `${API_BASE}/usage/tool/${toolId}/ratings`;
        } else {
            // Get all ratings
            const response = await fetch(url);
            const allUsages = await response.json();
            const ratingsWithTool = allUsages.filter(u => u.rating !== null);
            displayRatings(ratingsWithTool);
            return;
        }

        const response = await fetch(url);
        const ratings = await response.json();
        displayRatings(ratings, toolId);
    } catch (error) {
        console.error('Error loading ratings:', error);
        document.getElementById('ratingsGrid').innerHTML = '<div class="rating-placeholder">Error loading ratings</div>';
    }
}

function displayRatings(ratings, toolId = null) {
    const ratingsGrid = document.getElementById('ratingsGrid');
    
    if (ratings.length === 0) {
        ratingsGrid.innerHTML = '<div class="rating-placeholder">No ratings found</div>';
        return;
    }

    ratingsGrid.innerHTML = ratings.map(rating => {
        const stars = '⭐'.repeat(rating.rating || 0);
        return `
            <div class="rating-card">
                <div class="rating-header">
                    <div class="rating-tool-name">${rating.tool_name || 'Tool'}</div>
                    <div class="rating-stars">${stars}</div>
                </div>
                <div class="rating-user">by ${rating.user_name || 'Anonymous'}</div>
                <div class="rating-date">${rating.return_date || 'N/A'}</div>
                ${rating.review ? `<div class="rating-review">"${rating.review}"</div>` : ''}
            </div>
        `;
    }).join('');
}

// ============ MODAL HELPERS ============
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}
