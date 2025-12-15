/**
 * Utility Helper Functions
 * Các hàm tiện ích dùng chung
 * Common utility functions
 */

/**
 * Lấy màu dựa trên placement
 * Get color based on placement
 * @param {number} placement - Game placement (1-8)
 * @returns {string} Color class name
 */
export function getPlacementColor(placement) {
    if (placement <= 2) return 'green';
    if (placement <= 4) return 'yellow';
    if (placement <= 6) return 'orange';
    return 'red';
}

/**
 * Lấy hex color dựa trên placement
 * Get hex color based on placement
 * @param {number} placement - Game placement (1-8)
 * @returns {string} Hex color code
 */
export function getPlacementHexColor(placement) {
    if (placement <= 2) return '#38a169';
    if (placement <= 4) return '#d69e2e';
    if (placement <= 6) return '#dd6b20';
    return '#e53e3e';
}

/**
 * Format timestamp thành ngày tháng
 * Format timestamp to date string
 * @param {number|string} timestamp - Timestamp or date string
 * @returns {string} Formatted date (e.g., "Dec 15")
 */
export function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Escape single quotes cho onclick handlers
 * Escape single quotes for onclick handlers
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeQuotes(str) {
    return str.replace(/'/g, "\\'");
}
