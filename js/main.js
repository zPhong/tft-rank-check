/**
 * Main Application Entry Point
 * Điểm khởi đầu ứng dụng
 * Application entry point (MetaTFT Only)
 */

// Config imports
import { IGN_LIST } from './config/constants.js';
import { 
    getApiKey, setApiKey, getModel, setModel, hasApiKey
} from './config/settings.js';

// Service imports
import { fetchProfile, calculateStats } from './services/api.js';
import { fetchModels as fetchGeminiModels } from './services/gemini.js';

// Component imports
import { createProfileCard, createErrorCard } from './components/profileCard.js';
import { openModal, closeModal, setupModalCloseOnOutsideClick } from './components/modal.js';
import { analysisModule } from './components/analysis.js';
import { openMatchHistoryModal, closeMatchHistoryModal } from './components/matchHistoryModal.js';

// ============================================
// PROFILE LOADING
// ============================================

/**
 * Load tất cả profiles từ MetaTFT
 * Load all profiles from MetaTFT API
 */
async function loadAllProfiles() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const profilesGrid = document.getElementById('profilesGrid');
    const refreshBtn = document.getElementById('refreshBtn');

    // Show loading state
    loading.classList.add('active');
    loading.textContent = 'Loading from MetaTFT...';
    error.classList.remove('active');
    profilesGrid.innerHTML = '';
    refreshBtn.disabled = true;

    try {
        // Fetch all profiles in parallel using MetaTFT API
        const profilePromises = IGN_LIST.map(ign => fetchProfile(ign));
        const results = await Promise.all(profilePromises);

        // Sort by ratingNumeric (highest first)
        results.sort((a, b) => {
            const ratingA = a.success ? (a.data?.ranked?.rating_numeric || 0) : -1;
            const ratingB = b.success ? (b.data?.ranked?.rating_numeric || 0) : -1;
            return ratingB - ratingA;
        });

        // Clear grid and add cards
        profilesGrid.innerHTML = '';

        results.forEach(result => {
            let card;
            if (result.success) {
                card = createProfileCard(result);
            } else {
                card = createErrorCard(result.ign, result.error);
            }
            profilesGrid.appendChild(card);
        });

        loading.classList.remove('active');

    } catch (err) {
        console.error('Error loading profiles:', err);
        error.textContent = `Error: ${err.message}`;
        error.classList.add('active');
        loading.classList.remove('active');
    } finally {
        refreshBtn.disabled = false;
    }
}

// ============================================
// SETTINGS FUNCTIONS - GEMINI
// ============================================

/**
 * Cập nhật hiển thị trạng thái API
 * Update API status display
 */
function updateApiStatus() {
    // Gemini API status
    const key = getApiKey();
    const status = document.getElementById('apiStatus');
    const input = document.getElementById('apiKeyInput');
    
    if (key) {
        status.className = 'api-status connected';
        status.innerHTML = '✅ Connected';
        input.value = '••••••••••••';
    } else {
        status.className = 'api-status disconnected';
        status.innerHTML = '❌ No API key';
    }
    
    document.getElementById('modelSelect').value = getModel();
}

/**
 * Lưu API key
 * Save API key
 */
function saveApiKey() {
    const key = document.getElementById('apiKeyInput').value.trim();
    if (key && !key.startsWith('•')) {
        setApiKey(key);
        updateApiStatus();
        alert('✅ Saved!');
    }
}

/**
 * Lưu model
 * Save model
 */
function saveModel() {
    const model = document.getElementById('modelSelect').value;
    if (model) {
        setModel(model);
        alert('✅ Saved: ' + model);
    }
}

/**
 * Fetch và populate models dropdown
 * Fetch and populate models dropdown
 */
async function fetchModels() {
    if (!hasApiKey()) {
        alert('❌ Save API key first!');
        return;
    }
    
    try {
        const models = await fetchGeminiModels();
        const select = document.getElementById('modelSelect');
        select.innerHTML = '';
        
        const currentModel = getModel();
        models.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            if (name === currentModel) option.selected = true;
            select.appendChild(option);
        });
        
        alert('✅ Loaded!');
    } catch (e) {
        alert('❌ ' + e.message);
    }
}

/**
 * Mở settings modal
 * Open settings modal
 */
function openSettings() {
    openModal('settingsModal');
    updateApiStatus();
}

/**
 * Đóng settings modal
 * Close settings modal
 */
function closeSettings() {
    closeModal('settingsModal');
}

/**
 * Đóng analysis modal và reset state
 * Close analysis modal and reset state
 */
function closeAnalysis() {
    closeModal('analysisModal');
    analysisModule.resetAnalysisState();
}

// ============================================
// GLOBAL EXPORTS (for onclick handlers)
// ============================================

// Expose functions to window for HTML onclick handlers
window.loadAllProfiles = loadAllProfiles;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.closeAnalysis = closeAnalysis;
window.saveApiKey = saveApiKey;
window.saveModel = saveModel;
window.fetchModels = fetchModels;

// Expose analysis module
window.analysisModule = analysisModule;

// Expose match history modal functions
window.openMatchHistoryModal = openMatchHistoryModal;
window.closeMatchHistoryModal = closeMatchHistoryModal;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Load profiles on page load
    loadAllProfiles();
    
    // Update API status
    updateApiStatus();
    
    // Setup modal close on outside click
    setupModalCloseOnOutsideClick();
    
    console.log('TFT Rank Check initialized (MetaTFT Only)');
});
