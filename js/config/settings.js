/**
 * Settings Management
 * Quản lý cài đặt lưu trữ trong localStorage
 * Manages settings stored in localStorage
 */

const STORAGE_KEYS = {
    API_KEY: 'gemini_api_key',
    MODEL: 'gemini_model',
    RIOT_API_KEY: 'riot_api_key',
    DATA_SOURCE: 'data_source'
};

const DEFAULT_MODEL = 'gemini-2.0-flash';
const DEFAULT_DATA_SOURCE = 'metatft'; // 'metatft' or 'riot'

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

// ============================================
// RIOT API KEY MANAGEMENT
// ============================================

/**
 * Lấy Riot API key từ localStorage
 * Get Riot API key from localStorage
 * @returns {string} Riot API key or empty string
 */
export function getRiotApiKey() {
    return localStorage.getItem(STORAGE_KEYS.RIOT_API_KEY) || '';
}

/**
 * Lưu Riot API key vào localStorage
 * Save Riot API key to localStorage
 * @param {string} key - Riot API key to save
 */
export function setRiotApiKey(key) {
    localStorage.setItem(STORAGE_KEYS.RIOT_API_KEY, key);
}

/**
 * Kiểm tra xem có Riot API key hay không
 * Check if Riot API key exists
 * @returns {boolean}
 */
export function hasRiotApiKey() {
    return !!getRiotApiKey();
}

// ============================================
// DATA SOURCE MANAGEMENT
// ============================================

/**
 * Lấy data source hiện tại
 * Get current data source
 * @returns {string} 'metatft' or 'riot'
 */
export function getDataSource() {
    return localStorage.getItem(STORAGE_KEYS.DATA_SOURCE) || DEFAULT_DATA_SOURCE;
}

/**
 * Lưu data source
 * Save data source
 * @param {string} source - 'metatft' or 'riot'
 */
export function setDataSource(source) {
    localStorage.setItem(STORAGE_KEYS.DATA_SOURCE, source);
}

/**
 * Kiểm tra data source có phải Riot API không
 * Check if data source is Riot API
 * @returns {boolean}
 */
export function isRiotApiSource() {
    return getDataSource() === 'riot';
}
