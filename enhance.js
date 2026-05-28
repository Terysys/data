/* This JavaScript code is responsible for fetching vehicle fuel transactions 
data from the server, generating HTML content based on that data, 
and inserting it into the webpage. */

// This variable will hold the fetched fuel transaction data as an array of objects
let fuel = [];
let currentPage = 1;
let rowsPerPage = 10;
let currentFilter = 'all';
let searchTerm = '';

/* This function will fetch vehicle fuel transaction data from the 
server and return it as an array of objects */
async function vehicleFuelTransaction() {
    try {
        const response = await fetch('http://localhost/data/get_fuel.php');
        const data = await response.json();

        //convert to string 
        const trans = await JSON.stringify(data);

        //convert back to object
        fuel = await JSON.parse(trans);

        return fuel;

    } catch (error) {
        console.error('Error fetching vehicle fuel transaction data:', error);
        return [];
    }
}

// Function to filter and search data
function filterAndSearchData() {
    let filteredData = [...fuel];
    
    // Apply license plate filter
    if (currentFilter !== 'all') {
        filteredData = filteredData.filter(element => element.licenseNo === currentFilter);
    }
    
    // Apply search term
    if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        filteredData = filteredData.filter(element => 
            element.transactionID.toString().includes(term) ||
            element.accountNum.toString().includes(term) ||
            element.licenseNo.toLowerCase().includes(term) ||
            element.litres.toString().includes(term) ||
            element.price.toString().includes(term) ||
            element.amount.toString().includes(term) ||
            element.balance.toString().includes(term) ||
            element.date.includes(term)
        );
    }
    
    return filteredData;
}

// Function to get unique license plates for filter dropdown
function getUniqueLicensePlates() {
    const plates = new Set();
    fuel.forEach(element => {
        if (element.licenseNo !== null) {
            plates.add(element.licenseNo);
        }
    });
    return Array.from(plates).sort();
}

// Function to generate HTML for a specific page
function generateFuelTableHTML(page = 1) {
    const filteredData = filterAndSearchData();
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    
    if (page < 1) page = 1;
    if (page > totalPages && totalPages > 0) page = totalPages;
    
    currentPage = page;
    
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);
    
    let tableHTML = '';
    
    if (pageData.length === 0) {
        return `<tr><td colspan="9" class="text-center">No records found</td></tr>`;
    }
    
    pageData.forEach(element => {
        if (element.licenseNo !== null) {
            tableHTML +=
            `<tr>
                <td>${element.transactionID}</td>
                <td><span>🏦${element.accountNum}</span></td>
                <td><span>🚘${element.licenseNo}</span></td>
                <td><span>⛽${element.litres}</span></td>
                <td>${element.price}</td>
                <td><span>&#8358; ${element.amount.toLocaleString()}</span></td>
                <td><span>&#8358; ${element.balance.toLocaleString()}</span></td>
                <td><span>📅${element.date.split(' ')[0]}</span></td>
                <td>
                    <button class="btn btn-sm btn-info view-btn" data-id="${element.transactionID}">view</button>
                </td>
            </tr>`;
        }
    });
    
    return tableHTML;
}

// Function to generate pagination controls
function generatePaginationControls() {
    const filteredData = filterAndSearchData();
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    
    if (totalPages <= 1) return '';
    
    let paginationHTML = `
        <nav aria-label="Page navigation">
            <ul class="pagination justify-content-center">
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <button class="page-link" data-page="prev" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
                </li>
    `;
    
    // Show page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
        paginationHTML += `<li class="page-item"><button class="page-link" data-page="1">1</button></li>`;
        if (startPage > 2) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${currentPage === i ? 'active' : ''}">
                <button class="page-link" data-page="${i}">${i}</button>
            </li>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        paginationHTML += `<li class="page-item"><button class="page-link" data-page="${totalPages}">${totalPages}</button></li>`;
    }
    
    paginationHTML += `
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <button class="page-link" data-page="next" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
                </li>
            </ul>
        </nav>
    `;
    
    return paginationHTML;
}

// Function to generate info about current view
function generateViewInfo() {
    const filteredData = filterAndSearchData();
    const totalRecords = filteredData.length;
    const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const endRecord = Math.min(currentPage * rowsPerPage, totalRecords);
    
    return `
        <div class="row mb-3 align-items-center">
            <div class="col-md-6">
                <div class="btn-group" role="group">
                    <button id="refresh-btn" class="btn btn-primary">🔄 Refresh</button>
                    <button id="export-btn" class="btn btn-success">📊 Export to CSV</button>
                </div>
            </div>
            <div class="col-md-6 text-end">
                <strong>Showing ${startRecord} to ${endRecord} of ${totalRecords} records</strong>
            </div>
        </div>
    `;
}

// Function to generate filter dropdown
function generateFilterDropdown() {
    const uniquePlates = getUniqueLicensePlates();
    
    let filterHTML = `
        <div class="row mb-3">
            <div class="col-md-3">
                <label class="form-label">Filter by License Plate:</label>
                <select id="filter-select" class="form-select">
                    <option value="all" ${currentFilter === 'all' ? 'selected' : ''}>All Vehicles</option>
    `;
    
    uniquePlates.forEach(plate => {
        filterHTML += `<option value="${plate}" ${currentFilter === plate ? 'selected' : ''}>${plate}</option>`;
    });
    
    filterHTML += `
                </select>
            </div>
            <div class="col-md-4">
                <label class="form-label">Rows per page:</label>
                <select id="rows-select" class="form-select">
                    <option value="5" ${rowsPerPage === 5 ? 'selected' : ''}>5</option>
                    <option value="10" ${rowsPerPage === 10 ? 'selected' : ''}>10</option>
                    <option value="25" ${rowsPerPage === 25 ? 'selected' : ''}>25</option>
                    <option value="50" ${rowsPerPage === 50 ? 'selected' : ''}>50</option>
                </select>
            </div>
            <div class="col-md-5">
                <label class="form-label">Search:</label>
                <input type="text" id="search-input" class="form-control" placeholder="Search by ID, plate, amount, date..." value="${searchTerm}">
            </div>
        </div>
    `;
    
    return filterHTML;
}

// Function to generate summary statistics
function generateSummaryStats() {
    const filteredData = filterAndSearchData();
    
    let totalAmount = 0;
    let totalLitres = 0;
    let uniqueVehicles = new Set();
    
    filteredData.forEach(element => {
        totalAmount += element.amount;
        totalLitres += element.litres;
        if (element.licenseNo) uniqueVehicles.add(element.licenseNo);
    });
    
    return `
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <h6 class="card-title">Total Amount Spent</h6>
                        <h3>&#8358; ${totalAmount.toLocaleString()}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <h6 class="card-title">Total Litres Purchased</h6>
                        <h3>${totalLitres.toLocaleString()} L</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card bg-warning text-white">
                    <div class="card-body">
                        <h6 class="card-title">Active Vehicles</h6>
                        <h3>${uniqueVehicles.size}</h3>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Function to refresh the entire table
async function refreshTable() {
    // Show loading indicator
    const tableContainer = document.querySelector('#fuel-record');
    if (tableContainer) {
        tableContainer.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    }
    
    // Fetch fresh data
    await vehicleFuelTransaction();
    
    // Reset filters and pagination
    currentPage = 1;
    currentFilter = 'all';
    searchTerm = '';
    
    // Re-render everything
    renderFullInterface();
}

// Function to export data to CSV
function exportToCSV() {
    const filteredData = filterAndSearchData();
    
    if (filteredData.length === 0) {
        alert('No data to export!');
        return;
    }
    
    // Define CSV headers
    const headers = ['Transaction ID', 'Account Number', 'License Plate', 'Litres', 'Price per Litre', 'Amount', 'Balance', 'Date'];
    
    // Convert data to CSV rows
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    filteredData.forEach(element => {
        const row = [
            element.transactionID,
            element.accountNum,
            element.licenseNo,
            element.litres,
            element.price,
            element.amount,
            element.balance,
            element.date.split(' ')[0]
        ];
        csvRows.push(row.join(','));
    });
    
    // Download CSV file
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuel_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Function to setup event listeners
function setupEventListeners() {
    // Filter change listener
    const filterSelect = document.querySelector('#filter-select');
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            currentFilter = e.target.value;
            currentPage = 1;
            renderFullInterface();
        });
    }
    
    // Rows per page change listener
    const rowsSelect = document.querySelector('#rows-select');
    if (rowsSelect) {
        rowsSelect.addEventListener('change', (e) => {
            rowsPerPage = parseInt(e.target.value);
            currentPage = 1;
            renderFullInterface();
        });
    }
    
    // Search input listener (with debounce)
    const searchInput = document.querySelector('#search-input');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                searchTerm = e.target.value;
                currentPage = 1;
                renderFullInterface();
            }, 300);
        });
    }
    
    // Refresh button listener
    const refreshBtn = document.querySelector('#refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshTable);
    }
    
    // Export button listener
    const exportBtn = document.querySelector('#export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
    }
    
    // Pagination button listeners (delegation)
    const paginationContainer = document.querySelector('#pagination-container');
    if (paginationContainer) {
        paginationContainer.addEventListener('click', (e) => {
            const button = e.target.closest('.page-link');
            if (button && !button.disabled) {
                const page = button.getAttribute('data-page');
                if (page === 'prev') {
                    currentPage--;
                } else if (page === 'next') {
                    currentPage++;
                } else if (page) {
                    currentPage = parseInt(page);
                }
                renderFullInterface();
            }
        });
    }
    
    // View button listeners (delegation)
    const tableBody = document.querySelector('#fuel-record');
    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            const viewBtn = e.target.closest('.view-btn');
            if (viewBtn) {
                const transactionId = viewBtn.getAttribute('data-id');
                showTransactionDetails(transactionId);
            }
        });
    }
}

// Function to show transaction details in a modal
function showTransactionDetails(transactionId) {
    const transaction = fuel.find(t => t.transactionID == transactionId);
    
    if (transaction) {
        const modalHTML = `
            <div class="modal fade" id="transactionModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-info text-white">
                            <h5 class="modal-title">Transaction Details #${transaction.transactionID}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <table class="table table-borderless">
                                <tr><th>Account Number:</th><td>${transaction.accountNum}</td></tr>
                                <tr><th>License Plate:</th><td>${transaction.licenseNo}</td></tr>
                                <tr><th>Litres:</th><td>${transaction.litres} L</td></tr>
                                <tr><th>Price per Litre:</th><td>&#8358; ${transaction.price}</td></tr>
                                <tr><th>Total Amount:</th><td>&#8358; ${transaction.amount.toLocaleString()}</td></tr>
                                <tr><th>Balance After:</th><td>&#8358; ${transaction.balance.toLocaleString()}</td></tr>
                                <tr><th>Date:</th><td>${transaction.date}</td></tr>
                            </table>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.querySelector('#transactionModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal
        const modal = new bootstrap.Modal(document.querySelector('#transactionModal'));
        modal.show();
        
        // Remove modal from DOM when hidden
        document.querySelector('#transactionModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
}

// Function to render the entire interface
function renderFullInterface() {
    const container = document.querySelector('#fuel-record');
    const parentContainer = container.parentElement;
    
    // Add summary stats at the top if not exists
    let statsContainer = document.querySelector('#stats-container');
    if (!statsContainer) {
        statsContainer = document.createElement('div');
        statsContainer.id = 'stats-container';
        parentContainer.insertBefore(statsContainer, container);
    }
    
    // Add filter controls if not exists
    let filterContainer = document.querySelector('#filter-container');
    if (!filterContainer) {
        filterContainer = document.createElement('div');
        filterContainer.id = 'filter-container';
        parentContainer.insertBefore(filterContainer, container);
    }
    
    // Add pagination container after table if not exists
    let paginationContainer = document.querySelector('#pagination-container');
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'pagination-container';
        parentContainer.insertBefore(paginationContainer, container.nextSibling);
    }
    
    // Update stats
    statsContainer.innerHTML = generateSummaryStats();
    
    // Update filter controls
    filterContainer.innerHTML = generateFilterDropdown();
    
    // Update the table content
    const viewInfo = generateViewInfo();
    const tableHTML = `
        <div class="table-responsive">
            ${viewInfo}
            <table class="table table-bordered table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Transaction ID</th>
                        <th>Account Number</th>
                        <th>License Plate</th>
                        <th>Litres</th>
                        <th>Price/L</th>
                        <th>Amount</th>
                        <th>Balance</th>
                        <th>Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateFuelTableHTML(currentPage)}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = tableHTML;
    
    // Update pagination controls
    paginationContainer.innerHTML = generatePaginationControls();
    
    // Setup event listeners
    setupEventListeners();
}

// Initialize the application
async function init() {
    // Show loading state
    const container = document.querySelector('#fuel-record');
    if (container) {
        container.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    }
    
    // Fetch data
    await vehicleFuelTransaction();
    
    // Render the full interface
    renderFullInterface();
}

// Start the application
init();