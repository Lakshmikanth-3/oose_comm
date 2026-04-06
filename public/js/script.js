const API_BASE = '/api';
let calendarState = {
    monthOffset: 0,
    selectedTool: null,
    tool: null,
    usageHistory: []
};

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
                    <button onclick="deleteTool('${tool.tool_id}')" class="btn btn-danger btn-small">Delete</button>
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

async function deleteTool(toolId) {
    const confirmed = confirm('Delete this tool from inventory? It will be hidden from the app but its history will stay saved.');
    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/tools/${toolId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Tool removed from inventory');
            loadInventory();
            loadToolSelect();
            loadRatingToolSelect();
            loadTracking();
        } else {
            const data = await response.json().catch(() => ({}));
            alert(data.error || 'Error deleting tool');
        }
    } catch (error) {
        console.error('Error deleting tool:', error);
        alert('Error deleting tool');
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
        calendarState.selectedTool = null;
        calendarState.tool = null;
        calendarState.usageHistory = [];
        calendarState.monthOffset = 0;
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/tools/${toolId}/availability`);
        const data = await response.json();
        const tool = data.tool;
        const usages = data.usage_history;

        calendarState.selectedTool = toolId;
        calendarState.tool = tool;
        calendarState.usageHistory = usages;
        calendarState.monthOffset = 0;

        renderCalendar();
        renderUsageHistory();
    } catch (error) {
        console.error('Error loading calendar:', error);
        document.getElementById('calendarContainer').innerHTML = '<div class="calendar-placeholder">Error loading availability data</div>';
    }
}

function changeCalendarMonth(direction) {
    calendarState.monthOffset += direction;
    renderCalendar();
}

function renderCalendar() {
    if (!calendarState.tool) {
        return;
    }

    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() + calendarState.monthOffset, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const calendarStart = new Date(firstDay);
    calendarStart.setDate(firstDay.getDate() - firstDay.getDay());

    const monthName = targetDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const usageRanges = calendarState.usageHistory.map(usage => {
        const borrowDate = parseDateOnly(usage.borrow_date);
        const returnDate = parseDateOnly(usage.return_date || usage.expected_return_date || usage.borrow_date);
        return {
            start: borrowDate,
            end: returnDate,
            status: usage.status
        };
    });

    const weeks = [];
    let currentCell = new Date(calendarStart);

    for (let week = 0; week < 6; week += 1) {
        const days = [];
        for (let day = 0; day < 7; day += 1) {
            const cellDate = new Date(currentCell);
            const inCurrentMonth = cellDate.getMonth() === month;
            const isToday = isSameDate(cellDate, today);
            const activeUsage = usageRanges.find(range => isDateInRange(cellDate, range.start, range.end));

            days.push(`
                <div class="calendar-day ${inCurrentMonth ? '' : 'calendar-day-muted'} ${isToday ? 'calendar-day-today' : ''} ${activeUsage ? `calendar-day-${activeUsage.status}` : ''}">
                    <div class="calendar-day-number">${cellDate.getDate()}</div>
                    <div class="calendar-day-state">
                        ${activeUsage ? activeUsage.status.toUpperCase() : (inCurrentMonth ? 'Available' : '&nbsp;')}
                    </div>
                </div>
            `);
            currentCell.setDate(currentCell.getDate() + 1);
        }
        weeks.push(`<div class="calendar-week">${days.join('')}</div>`);
    }

    document.getElementById('calendarContainer').innerHTML = `
        <div class="calendar-header-card">
            <div>
                <h3>${calendarState.tool.name}</h3>
                <p>${calendarState.tool.category} • ${calendarState.tool.location}</p>
            </div>
            <div class="calendar-tool-meta">
                <span class="status-badge ${calendarState.tool.quantity_available > 0 ? 'badge-available' : 'badge-unavailable'}">
                    ${calendarState.tool.quantity_available} Available
                </span>
            </div>
        </div>
        <div class="calendar-month-bar">
            <button class="btn btn-primary btn-small" onclick="changeCalendarMonth(-1)">&larr; Prev</button>
            <div class="calendar-month-title">${monthName}</div>
            <button class="btn btn-primary btn-small" onclick="changeCalendarMonth(1)">Next &rarr;</button>
        </div>
        <div class="calendar-grid">
            ${dayLabels.map(day => `<div class="calendar-dow">${day}</div>`).join('')}
            ${weeks.join('')}
        </div>
        <div class="calendar-legend">
            <span><i class="legend-box legend-available"></i>Available</span>
            <span><i class="legend-box legend-borrowed"></i>Borrowed</span>
            <span><i class="legend-box legend-returned"></i>Returned</span>
            <span><i class="legend-box legend-today"></i>Today</span>
        </div>
    `;
}

function renderUsageHistory() {
    const usageHtml = calendarState.usageHistory.map(usage => `
        <div class="usage-item">
            <div>
                <strong>Date:</strong> ${usage.borrow_date} to ${usage.expected_return_date || 'Not set'}
                <br><strong>Status:</strong> ${usage.status}
            </div>
            <span class="usage-status status-${usage.status}">${usage.status.toUpperCase()}</span>
        </div>
    `).join('');

    document.getElementById('usageList').innerHTML = usageHtml || '<div class="calendar-placeholder">No usage history</div>';
}

function parseDateOnly(dateValue) {
    if (!dateValue) {
        return null;
    }

    const date = new Date(dateValue);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDate(left, right) {
    return left.getFullYear() === right.getFullYear()
        && left.getMonth() === right.getMonth()
        && left.getDate() === right.getDate();
}

function isDateInRange(date, start, end) {
    if (!start || !end) {
        return false;
    }

    const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return current >= start && current <= end;
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
        const url = toolId
            ? `${API_BASE}/usage?tool_id=${toolId}&ratings=1`
            : `${API_BASE}/usage?ratings=1`;

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
