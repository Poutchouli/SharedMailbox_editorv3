/**
 * Shared Mailbox Manager - Main Application
 * Handles the core functionality of the mailbox management system
 */

// Global variables to store original and current data
let originalMailboxData = new Map(); // Map<Identity, Set<User>>
let currentMailboxData = new Map(); // Map<Identity, Set<User>>

// DOM Elements
const csvFileInput = document.getElementById('csvFile');
const mailboxContainer = document.getElementById('mailboxContainer');
const mailboxTableBody = document.getElementById('mailboxTableBody');
const downloadChangesBtn = document.getElementById('downloadChangesBtn');
const searchMailboxInput = document.getElementById('searchMailbox');
const messageBoxCloseBtn = document.getElementById('messageBoxCloseBtn');

// Constants
const MAX_MAILBOXES_PER_USER = 7;

/**
 * Gets all unique users from the current mailbox data for autocomplete.
 * @returns {Array<string>} Array of unique user emails.
 */
function getAllUsers() {
    const allUsers = new Set();
    currentMailboxData.forEach((users) => {
        users.forEach(user => allUsers.add(user));
    });
    return Array.from(allUsers).sort();
}

/**
 * Gets all shared mailboxes that a specific user has access to.
 * @param {string} user - The user email to check.
 * @returns {Array<string>} Array of shared mailbox identities.
 */
function getUserMailboxes(user) {
    const userMailboxes = [];
    currentMailboxData.forEach((users, identity) => {
        if (users.has(user)) {
            userMailboxes.push(identity);
        }
    });
    return userMailboxes.sort();
}

/**
 * Checks if a user has reached the maximum number of shared mailboxes.
 * @param {string} user - The user email to check.
 * @returns {boolean} True if user has reached the maximum limit.
 */
function hasMaxMailboxes(user) {
    return getUserMailboxes(user).length >= MAX_MAILBOXES_PER_USER;
}

/**
 * Renders the current mailbox data into the HTML table.
 * @param {Map<string, Set<string>>} data - The mailbox data to render.
 * @param {string} filterText - Optional text to filter mailboxes by identity.
 */
function renderMailboxes(data, filterText = '') {
    mailboxTableBody.innerHTML = ''; // Clear existing rows

    const sortedIdentities = Array.from(data.keys()).sort();

    sortedIdentities.forEach(identity => {
        // Filter logic
        if (filterText && !identity.toLowerCase().includes(filterText.toLowerCase())) {
            return;
        }

        const users = Array.from(data.get(identity)).sort(); // Sort users for consistent display
        const row = createMailboxRow(identity, users, addUser, removeUser);
        mailboxTableBody.appendChild(row);
    });
}

/**
 * Adds a user to a specific shared mailbox in the current data.
 * @param {string} identity - The shared mailbox identity.
 * @param {string} user - The user email to add.
 */
function addUser(identity, user) {
    // Validate email format
    if (!isValidEmail(user)) {
        showMessageBox(`"${user}" is not a valid email address.`, 'error');
        return;
    }

    if (!currentMailboxData.has(identity)) {
        currentMailboxData.set(identity, new Set());
    }
    
    if (currentMailboxData.get(identity).has(user)) {
        showMessageBox(`User "${user}" already has FullAccess to "${identity}".`, 'warning');
        return;
    }
    
    // Check if user already has maximum number of shared mailboxes
    if (hasMaxMailboxes(user)) {
        const userMailboxes = getUserMailboxes(user);
        const mailboxList = userMailboxes.map(mailbox => `• ${mailbox}`).join('\n');
        showMessageBox(`Cannot add user "${user}" to another shared mailbox. User already has access to ${userMailboxes.length} shared mailboxes (maximum is ${MAX_MAILBOXES_PER_USER}).\n\nCurrent mailboxes:\n${mailboxList}`, 'error');
        return;
    }
    
    currentMailboxData.get(identity).add(user);
    renderMailboxes(currentMailboxData, searchMailboxInput.value); // Re-render to reflect changes
    showMessageBox(`User "${user}" successfully added to "${identity}".`, 'success');
}

/**
 * Removes a user from a specific shared mailbox in the current data.
 * @param {string} identity - The shared mailbox identity.
 * @param {string} user - The user email to remove.
 */
function removeUser(identity, user) {
    if (currentMailboxData.has(identity)) {
        currentMailboxData.get(identity).delete(user);
        // If the set becomes empty, we can optionally remove the identity from the map
        if (currentMailboxData.get(identity).size === 0) {
            currentMailboxData.delete(identity);
        }
        renderMailboxes(currentMailboxData, searchMailboxInput.value); // Re-render to reflect changes
        showMessageBox(`User "${user}" removed from "${identity}".`, 'success');
    }
}

/**
 * Validates email format.
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Handles the CSV file upload.
 */
function handleCSVUpload(event) {
    const file = event.target.files[0];
    if (file) {
        showLoading(csvFileInput.parentElement);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvText = e.target.result;
                
                // Validate CSV first
                const validation = validateCSV(csvText);
                if (!validation.isValid) {
                    hideLoading(csvFileInput.parentElement);
                    showMessageBox(`CSV validation failed:\n${validation.errors.join('\n')}`, 'error');
                    return;
                }
                
                // Show warnings if any
                if (validation.warnings.length > 0) {
                    console.warn('CSV warnings:', validation.warnings);
                }
                
                originalMailboxData = parseCSV(csvText);
                
                // Create a deep copy for current data to track changes
                currentMailboxData = new Map();
                originalMailboxData.forEach((users, identity) => {
                    currentMailboxData.set(identity, new Set(users));
                });

                hideLoading(csvFileInput.parentElement);

                if (originalMailboxData.size > 0) {
                    renderMailboxes(currentMailboxData);
                    mailboxContainer.classList.remove('hidden'); // Show the management section
                    showMessageBox("CSV loaded successfully! You can now manage mailbox access.", 'success');
                } else {
                    mailboxContainer.classList.add('hidden');
                    showMessageBox("No 'FullAccess' entries found or CSV is empty after parsing.", 'warning');
                }
            } catch (error) {
                hideLoading(csvFileInput.parentElement);
                console.error("Error parsing CSV:", error);
                showMessageBox("Error parsing CSV file. Please ensure it's correctly formatted.", 'error');
            }
        };
        
        reader.onerror = () => {
            hideLoading(csvFileInput.parentElement);
            showMessageBox("Error reading the file. Please try again.", 'error');
        };
        
        reader.readAsText(file);
    } else {
        mailboxContainer.classList.add('hidden');
        showMessageBox("Please select a CSV file.", 'warning');
    }
}

/**
 * Handles the "Download Changes" button click.
 */
function handleDownloadChanges() {
    const changesCSV = generateChangesCSV(originalMailboxData, currentMailboxData);
    if (changesCSV) {
        downloadCSV(changesCSV, 'mailbox_changes.csv');
        showMessageBox("Changes CSV downloaded successfully!", 'success');
    } else {
        showMessageBox("No changes detected to download.", 'info');
    }
}

/**
 * Handles mailbox search/filter input with debouncing.
 */
const handleSearch = debounce((event) => {
    const filterText = event.target.value;
    renderMailboxes(currentMailboxData, filterText);
}, 300);

/**
 * Initialize the application.
 */
function initializeApp() {
    // Event listeners
    csvFileInput.addEventListener('change', handleCSVUpload);
    downloadChangesBtn.addEventListener('click', handleDownloadChanges);
    searchMailboxInput.addEventListener('input', handleSearch);
    messageBoxCloseBtn.addEventListener('click', hideMessageBox);

    // Close message box on outside click
    document.getElementById('messageBox').addEventListener('click', (e) => {
        if (e.target.id === 'messageBox') {
            hideMessageBox();
        }
    });

    // Close message box on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideMessageBox();
        }
    });

    // Initial state: hide mailbox container until CSV is loaded
    mailboxContainer.classList.add('hidden');
    
    console.log('Shared Mailbox Manager initialized successfully');
}

// Initialize the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
