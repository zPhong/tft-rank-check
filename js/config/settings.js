/**
 * Settings Management
 * Quản lý cài đặt lưu trữ trong localStorage
 * Manages settings stored in localStorage
 */

const STORAGE_KEYS = {
    API_KEY: 'gemini_api_key',
    MODEL: 'gemini_model'
};

const DEFAULT_MODEL = 'gemini-2.0-flash';

/**
 * Lấy API key từ localStorage
 * Get API key from localStorage
 * @returns {string} API key or empty string
 */
export function getApiKey() {
    return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
}

/**
 * Lưu API key vào localStorage
 * Save API key to localStorage
 * @param {string} key - API key to save
 */
export function setApiKey(key) {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key);
}

/**
 * Lấy model đã chọn từ localStorage
 * Get selected model from localStorage
 * @returns {string} Model name
 */
export function getModel() {
    return localStorage.getItem(STORAGE_KEYS.MODEL) || DEFAULT_MODEL;
}

/**
 * Lưu model vào localStorage
 * Save model to localStorage
 * @param {string} model - Model name to save
 */
export function setModel(model) {
    localStorage.setItem(STORAGE_KEYS.MODEL, model);
}

/**
 * Kiểm tra xem có API key hay không
 * Check if API key exists
 * @returns {boolean}
 */
export function hasApiKey() {
    return !!getApiKey();
}
