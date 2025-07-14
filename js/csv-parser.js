/**
 * CSV Parser Module
 * Handles parsing of CSV files containing shared mailbox data
 */

/**
 * Parses a CSV string into a structured data format.
 * Expected format: "Identity";"User";"AccessRights"
 * @param {string} csvText - The raw CSV content.
 * @returns {Map<string, Set<string>>} A map where keys are mailbox identities and values are sets of users with FullAccess.
 */
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const data = new Map(); // Map<Identity, Set<User>>

    // Skip header row
    if (lines.length <= 1) {
        showMessageBox("The CSV file appears to be empty or only contains headers.");
        return data;
    }

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines

        // Split by semicolon, handling quoted fields
        const parts = line.match(/(?:[^;"]+|"[^"]*")+/g);

        if (!parts || parts.length < 3) {
            console.warn(`Skipping malformed CSV line: ${line}`);
            continue;
        }

        // Remove quotes from fields
        const identity = parts[0].replace(/"/g, '');
        const user = parts[1].replace(/"/g, '');
        const accessRights = parts[2].replace(/"/g, '');

        if (accessRights === 'FullAccess') {
            if (!data.has(identity)) {
                data.set(identity, new Set());
            }
            data.get(identity).add(user);
        }
    }
    return data;
}

/**
 * Generates the changes CSV based on original and current mailbox data.
 * @param {Map<string, Set<string>>} originalData - Original mailbox data
 * @param {Map<string, Set<string>>} currentData - Current mailbox data
 * @returns {string|null} The CSV content for changes, or null if no changes.
 */
function generateChangesCSV(originalData, currentData) {
    const changes = [];
    const header = `"Identity";"User";"AccessRights";"Action"`;
    changes.push(header);

    // Track removals
    originalData.forEach((originalUsers, identity) => {
        const currentUsers = currentData.get(identity) || new Set();
        originalUsers.forEach(user => {
            if (!currentUsers.has(user)) {
                changes.push(`"${identity}";"${user}";"FullAccess";"Remove"`);
            }
        });
    });

    // Track additions
    currentData.forEach((currentUsers, identity) => {
        const originalUsers = originalData.get(identity) || new Set();
        currentUsers.forEach(user => {
            if (!originalUsers.has(user)) {
                changes.push(`"${identity}";"${user}";"FullAccess";"Add"`);
            }
        });
    });

    if (changes.length === 1) { // Only header means no changes
        return null;
    }
    return changes.join('\n');
}

/**
 * Downloads a CSV file with the given content and filename.
 * @param {string} csvContent - The CSV content to download
 * @param {string} filename - The filename for the download
 */
function downloadCSV(csvContent, filename = 'mailbox_changes.csv') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Validates CSV file format and content.
 * @param {string} csvText - The CSV content to validate
 * @returns {Object} Validation result with isValid boolean and errors array
 */
function validateCSV(csvText) {
    const result = {
        isValid: true,
        errors: [],
        warnings: []
    };

    const lines = csvText.trim().split('\n');
    
    if (lines.length === 0) {
        result.isValid = false;
        result.errors.push('CSV file is empty');
        return result;
    }

    // Check header
    const header = lines[0].toLowerCase();
    if (!header.includes('identity') || !header.includes('user') || !header.includes('access')) {
        result.warnings.push('CSV header may not match expected format: "Identity";"User";"AccessRights"');
    }

    // Check data rows
    let validDataRows = 0;
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.match(/(?:[^;"]+|"[^"]*")+/g);
        if (!parts || parts.length < 3) {
            result.warnings.push(`Line ${i + 1}: Malformed data - expected 3 columns`);
            continue;
        }

        validDataRows++;
    }

    if (validDataRows === 0) {
        result.isValid = false;
        result.errors.push('No valid data rows found in CSV');
    }

    return result;
}
