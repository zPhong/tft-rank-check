/**
 * Modal Component
 * Quản lý mở/đóng modal
 * Manages opening/closing modals
 */

/**
 * Mở modal theo ID
 * Open modal by ID
 * @param {string} modalId - Modal element ID
 */
export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * Đóng modal theo ID
 * Close modal by ID
 * @param {string} modalId - Modal element ID
 */
export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Setup đóng modal khi click bên ngoài
 * Setup closing modal when clicking outside
 */
export function setupModalCloseOnOutsideClick() {
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

// Các hàm tiện ích cho modal cụ thể
// Utility functions for specific modals

export function openSettingsModal() {
    openModal('settingsModal');
}

export function closeSettingsModal() {
    closeModal('settingsModal');
}

export function openAnalysisModal() {
    openModal('analysisModal');
}

export function closeAnalysisModal() {
    closeModal('analysisModal');
}
