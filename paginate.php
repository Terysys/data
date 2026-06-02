To add debouncing and column sorting, you need to delay the search requests until typing stops, track the active sort column and direction in JavaScript, and pass those parameters to your PHP backend.
Here is how to update your full setup.
## 1. Update the HTML (index.html)
Add clickable header links with sorting indicators (▲/▼) so users can toggle sorting directions.

<div class="search-container">
    <input type="text" id="search-input" placeholder="Search by name or email..." autocomplete="off">
</div>

<table id="data-table">
    <thead>
        <tr>
            <!-- Add headers with action targets and styling for clicking -->
            <th style="cursor:pointer;" onclick="changeSort('id')">ID <span id="sort-icon-id"></span></th>
            <th style="cursor:pointer;" onclick="changeSort('name')">Name <span id="sort-icon-name"></span></th>
            <th style="cursor:pointer;" onclick="changeSort('email')">Email <span id="sort-icon-email"></span></th>
        </tr>
    </thead>
    <tbody>
        <!-- JS inserts rows here -->
    </tbody>
</table>

<div id="pagination-controls"></div>

## 2. Update the PHP Backend (data.php)
Sanitise the sort inputs against a whitelist of valid columns to prevent SQL injection, then dynamically append the ORDER BY clause to your query.

<?php
header('Content-Type: application/json');

$pdo = new PDO("mysql:host=localhost;dbname=your_db;charset=utf8", "root", "");

$limit = 10; 
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
if ($page < 1) $page = 1;
$offset = ($page - 1) * $limit;

$search = isset($_GET['search']) ? trim($_GET['search']) : '';

// 1. Capture and validate Sorting Parameters
$allowed_columns = ['id', 'name', 'email'];
$sort_column = isset($_GET['sort']) && in_array($_GET['sort'], $allowed_columns) ? $_GET['sort'] : 'id';
$sort_direction = isset($_GET['direction']) && strtoupper($_GET['direction']) === 'DESC' ? 'DESC' : 'ASC';

$where_clause = "";
if ($search !== '') {
    $where_clause = " WHERE name LIKE :search OR email LIKE :search";
}

// 2. Safely string-inject columns (PDO parameters cannot be used for column names or keywords)
$sql = "SELECT id, name, email FROM users" . $where_clause . " ORDER BY " . $sort_column . " " . $sort_direction . " LIMIT :offset, :limit";
$stmt = $pdo->prepare($sql);

if ($search !== '') {
    $stmt->bindValue(':search', '%' . $search . '%', PDO::PARAM_STR);
}
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->execute();
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

// 3. Count total matching rows
$count_sql = "SELECT COUNT(*) FROM users" . $where_clause;
$count_stmt = $pdo->prepare($count_sql);
if ($search !== '') {
    $count_stmt->bindValue(':search', '%' . $search . '%', PDO::PARAM_STR);
}
$count_stmt->execute();
$total_rows = $count_stmt->fetchColumn();

$total_pages = ceil($total_rows / $limit);

echo json_encode([
    'data' => $data,
    'current_page' => $page,
    'total_pages' => $total_pages
]);

## 3. Update the JavaScript (script.js)
Wrap your search listener in a custom debounce helper function and build standard sort-state tracking logic.

let currentPage = 1;let searchQuery = '';let currentSortColumn = 'id';let currentSortDirection = 'ASC';
// --- DEBOUNCE UTILITY ---// Delays execution of a function until 'delay' milliseconds have passed since last callfunction debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}
// Attach debounced search listener (300ms pause required to hit server)
document.getElementById('search-input').addEventListener('input', debounce((e) => {
    searchQuery = e.target.value;
    currentPage = 1; 
    loadPage(currentPage);
}, 300));
// --- SORTING MECHANICS ---function changeSort(column) {
    if (currentSortColumn === column) {
        // Toggle direction if clicking the same column header
        currentSortDirection = currentSortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
        // Default to ascending on a brand new column switch
        currentSortColumn = column;
        currentSortDirection = 'ASC';
    }
    currentPage = 1; // Reset window to page 1 on active re-order
    loadPage(currentPage);
}
function updateSortIcons() {
    // Reset all target headers
    ['id', 'name', 'email'].forEach(col => {
        document.getElementById(`sort-icon-${col}`).innerText = '';
    });
    // Render status arrow onto selected column
    const arrow = currentSortDirection === 'ASC' ? ' ▲' : ' ▼';
    document.getElementById(`sort-icon-${currentSortColumn}`).innerText = arrow;
}
// --- FETCH & LAYOUT ---function loadPage(page) {
    updateSortIcons();
    
    const url = `data.php?page=${page}` +
                `&search=${encodeURIComponent(searchQuery)}` +
                `&sort=${currentSortColumn}` +
                `&direction=${currentSortDirection}`;

    fetch(url)
        .then(response => response.json())
        .then(res => {
            currentPage = res.current_page;
            renderTable(res.data);
            renderControls(res.total_pages);
        })
        .catch(error => console.error('Error fetching data:', error));
}
function renderTable(items) {
    const tbody = document.querySelector('#data-table tbody');
    tbody.innerHTML = '';

    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No results found</td></tr>';
        return;
    }

    items.forEach(item => {
        tbody.innerHTML += `<tr>
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.email}</td>
        </tr>`;
    });
}
// Use the exact same truncated 'renderControls(totalPages)' function from the previous step here...
// Application Initialisation
loadPage(currentPage);

If you are interested, let me know if you would like to:

* Add a rows-per-page dropdown selection menu (e.g., 5, 10, 25, 50).
* Add a CSS loader template to make processing state visual changes smooth.