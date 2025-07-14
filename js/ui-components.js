/**
 * UI Components Module
 * Contains reusable UI components and utilities
 */

/**
 * Creates an autocomplete input field.
 * @param {string} placeholder - Placeholder text for the input.
 * @param {Array<string>} suggestions - Array of suggestion strings.
 * @returns {Object} Object containing the input element and container.
 */
function createAutocompleteInput(placeholder, suggestions) {
    const container = document.createElement('div');
    container.classList.add('relative');

    const input = document.createElement('input');
    input.type = 'email';
    input.placeholder = placeholder;
    input.classList.add('w-full', 'p-1', 'text-xs', 'border', 'border-gray-300', 'rounded', 'focus:outline-none', 'focus:ring-1', 'focus:ring-blue-500');

    const dropdown = document.createElement('div');
    dropdown.classList.add('autocomplete-dropdown', 'absolute', 'top-full', 'left-0', 'right-0', 'bg-white', 'border', 'border-gray-300', 'rounded-b', 'shadow-lg', 'max-h-24', 'overflow-y-auto', 'z-10', 'hidden');

    container.appendChild(input);
    container.appendChild(dropdown);

    let filteredSuggestions = [];

    function updateDropdown(value) {
        filteredSuggestions = suggestions.filter(suggestion => 
            suggestion.toLowerCase().includes(value.toLowerCase()) && 
            suggestion.toLowerCase() !== value.toLowerCase()
        ).slice(0, 4); // Limit to 4 suggestions for more compact display

        dropdown.innerHTML = '';
        
        if (filteredSuggestions.length > 0 && value.length > 0) {
            filteredSuggestions.forEach(suggestion => {
                const option = document.createElement('div');
                option.classList.add('autocomplete-option', 'px-2', 'py-1', 'text-xs', 'cursor-pointer', 'hover:bg-blue-100', 'truncate');
                option.textContent = suggestion;
                option.title = suggestion; // Show full email on hover
                option.addEventListener('click', () => {
                    input.value = suggestion;
                    dropdown.classList.add('hidden');
                });
                dropdown.appendChild(option);
            });
            dropdown.classList.remove('hidden');
        } else {
            dropdown.classList.add('hidden');
        }
    }

    // Event listeners
    input.addEventListener('input', (e) => {
        updateDropdown(e.target.value);
    });

    input.addEventListener('focus', (e) => {
        updateDropdown(e.target.value);
    });

    input.addEventListener('blur', (e) => {
        // Delay hiding dropdown to allow click on options
        setTimeout(() => {
            dropdown.classList.add('hidden');
        }, 200);
    });

    input.addEventListener('keydown', (e) => {
        const activeOption = dropdown.querySelector('.selected');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const options = dropdown.querySelectorAll('.autocomplete-option');
            if (options.length > 0) {
                if (activeOption) {
                    activeOption.classList.remove('selected');
                    const nextOption = activeOption.nextElementSibling || options[0];
                    nextOption.classList.add('selected');
                } else {
                    options[0].classList.add('selected');
                }
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const options = dropdown.querySelectorAll('.autocomplete-option');
            if (options.length > 0) {
                if (activeOption) {
                    activeOption.classList.remove('selected');
                    const prevOption = activeOption.previousElementSibling || options[options.length - 1];
                    prevOption.classList.add('selected');
                } else {
                    options[options.length - 1].classList.add('selected');
                }
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeOption) {
                input.value = activeOption.textContent;
                dropdown.classList.add('hidden');
            }
        } else if (e.key === 'Escape') {
            dropdown.classList.add('hidden');
        }
    });

    return { input, container };
}

/**
 * Creates a user tag element with remove button.
 * @param {string} user - User email
 * @param {Function} onRemove - Callback function when remove is clicked
 * @returns {HTMLElement} The user tag element
 */
function createUserTag(user, onRemove) {
    const userTag = document.createElement('div');
    userTag.classList.add('user-tag', 'flex', 'items-center', 'px-1.5', 'py-0.5', 'rounded', 'text-xs', 'font-medium', 'bg-blue-100', 'text-blue-800', 'min-w-0');
    
    const userSpan = document.createElement('span');
    // Extract username part before @ for better space utilization
    const displayName = user.includes('@') ? user.split('@')[0] : user;
    userSpan.textContent = displayName;
    userSpan.classList.add('truncate', 'max-w-[80px]');
    userSpan.title = user; // Show full email on hover
    userTag.appendChild(userSpan);

    const removeBtn = document.createElement('button');
    removeBtn.classList.add('ml-1', 'text-blue-600', 'hover:text-blue-900', 'focus:outline-none', 'flex-shrink-0', 'w-3', 'h-3', 'flex', 'items-center', 'justify-center');
    removeBtn.innerHTML = '×';
    removeBtn.title = `Remove ${user}`;
    removeBtn.addEventListener('click', onRemove);
    userTag.appendChild(removeBtn);

    return userTag;
}

/**
 * Shows a loading state on an element.
 * @param {HTMLElement} element - Element to show loading on
 */
function showLoading(element) {
    element.classList.add('loading');
}

/**
 * Hides loading state from an element.
 * @param {HTMLElement} element - Element to hide loading from
 */
function hideLoading(element) {
    element.classList.remove('loading');
}

/**
 * Displays a custom message box instead of alert().
 * @param {string} message - The message to display.
 * @param {string} type - Message type: 'info', 'success', 'warning', 'error'
 */
function showMessageBox(message, type = 'info') {
    const messageBox = document.getElementById('messageBox');
    const messageBoxText = document.getElementById('messageBoxText');
    
    if (!messageBox || !messageBoxText) {
        console.error('Message box elements not found');
        alert(message); // Fallback to alert
        return;
    }

    messageBoxText.textContent = message;
    messageBox.classList.remove('hidden');
    
    // Add type-specific styling if needed
    const messageBoxContent = messageBox.querySelector('.bg-white');
    messageBoxContent.classList.remove('border-l-4', 'border-blue-500', 'border-green-500', 'border-yellow-500', 'border-red-500');
    
    switch (type) {
        case 'success':
            messageBoxContent.classList.add('border-l-4', 'border-green-500');
            break;
        case 'warning':
            messageBoxContent.classList.add('border-l-4', 'border-yellow-500');
            break;
        case 'error':
            messageBoxContent.classList.add('border-l-4', 'border-red-500');
            break;
        default:
            messageBoxContent.classList.add('border-l-4', 'border-blue-500');
    }
}

/**
 * Hides the message box.
 */
function hideMessageBox() {
    const messageBox = document.getElementById('messageBox');
    if (messageBox) {
        messageBox.classList.add('hidden');
    }
}

/**
 * Creates a table row for a mailbox.
 * @param {string} identity - Mailbox identity
 * @param {Array<string>} users - Array of users with access
 * @param {Function} onAddUser - Callback for adding a user
 * @param {Function} onRemoveUser - Callback for removing a user
 * @returns {HTMLElement} The table row element
 */
function createMailboxRow(identity, users, onAddUser, onRemoveUser) {
    const row = document.createElement('tr');
    row.classList.add('table-row-hover', 'hover:bg-gray-50');

    // Identity Cell
    const identityCell = document.createElement('td');
    identityCell.classList.add('px-3', 'py-3', 'text-xs', 'font-medium', 'text-gray-900', 'break-words', 'leading-tight');
    identityCell.textContent = identity;
    row.appendChild(identityCell);

    // Users Cell
    const usersCell = document.createElement('td');
    usersCell.classList.add('px-3', 'py-3', 'text-xs', 'text-gray-500');

    const userListDiv = document.createElement('div');
    userListDiv.classList.add('flex', 'flex-wrap', 'gap-1', 'items-start');

    users.forEach(user => {
        const userTag = createUserTag(user, () => onRemoveUser(identity, user));
        userListDiv.appendChild(userTag);
    });
    
    usersCell.appendChild(userListDiv);
    row.appendChild(usersCell);

    // Actions Cell (Add User)
    const actionsCell = document.createElement('td');
    actionsCell.classList.add('px-3', 'py-3', 'text-xs', 'font-medium');

    const addUserContainer = document.createElement('div');
    addUserContainer.classList.add('space-y-1');

    const allUsers = getAllUsers();
    const autocompleteInput = createAutocompleteInput('User email', allUsers);
    autocompleteInput.input.classList.remove('p-1');
    autocompleteInput.input.classList.add('p-0.5', 'text-xs');
    addUserContainer.appendChild(autocompleteInput.container);

    const addBtn = document.createElement('button');
    addBtn.classList.add('action-button', 'bg-blue-500', 'hover:bg-blue-600', 'text-white', 'text-xs', 'font-bold', 'py-0.5', 'px-1.5', 'rounded', 'transition', 'duration-200', 'ease-in-out', 'w-full');
    addBtn.textContent = 'Add';
    addBtn.addEventListener('click', () => {
        const newUser = autocompleteInput.input.value.trim();
        if (newUser) {
            onAddUser(identity, newUser);
            autocompleteInput.input.value = '';
        } else {
            showMessageBox("Please enter a user email to add.", 'warning');
        }
    });
    addUserContainer.appendChild(addBtn);

    actionsCell.appendChild(addUserContainer);
    row.appendChild(actionsCell);

    return row;
}

/**
 * Debounce function to limit how often a function can be called.
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
