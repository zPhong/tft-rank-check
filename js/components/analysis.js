/**
 * AI Analysis Component
 * Quản lý UI và logic phân tích AI
 * Manages AI analysis UI and logic
 */

import { profileDataStore } from '../services/api.js';
import { getApiKey, getModel, hasApiKey } from '../config/settings.js';
import { fetchModels, callGeminiAPI, buildPrompt, formatAnalysisResult } from '../services/gemini.js';
import { getPlacementHexColor } from '../utils/helpers.js';
import { openModal, closeModal, openSettingsModal, closeAnalysisModal } from './modal.js';

// State cho phân tích / Analysis state
let currentPlayer = null;
let selectedMatches = [];
let analysisMode = 'all';

/**
 * Lấy các trận để phân tích dựa trên mode
 * Get matches to analyze based on mode
 * @param {Object} data - Player data
 * @returns {Array} Array of matches
 */
function getMatchesToAnalyze(data) {
    const matches = data.matches || [];
    if (analysisMode === 'top10') return matches.slice(0, 10);
    if (analysisMode === 'select') return selectedMatches.map(i => matches[i]).filter(Boolean);
    return matches.slice(0, 20);
}

/**
 * Cập nhật số lượng trận đã chọn
 * Update selected match count display
 */
function updateSelectedCount() {
    const el = document.getElementById('selectedCount');
    if (el) el.textContent = `Selected: ${selectedMatches.length}`;
}

/**
 * Đặt mode chọn trận
 * Set match selection mode
 * @param {string} mode - 'all', 'top10', or 'select'
 * @param {HTMLElement} element - Clicked element
 */
export function setMode(mode, element) {
    analysisMode = mode;
    selectedMatches = [];
    
    document.querySelectorAll('.match-option').forEach(e => e.classList.remove('active'));
    element.classList.add('active');
    
    document.getElementById('matchGridWrap').style.display = mode === 'select' ? 'block' : 'none';
    document.querySelectorAll('.match-grid-item').forEach(e => e.classList.remove('selected'));
    
    updateSelectedCount();
}

/**
 * Toggle chọn trận
 * Toggle match selection
 * @param {number} idx - Match index
 */
export function toggleMatch(idx) {
    const el = document.querySelector(`.match-grid-item[data-idx="${idx}"]`);
    
    if (selectedMatches.includes(idx)) {
        selectedMatches = selectedMatches.filter(i => i !== idx);
        el.classList.remove('selected');
    } else {
        selectedMatches.push(idx);
        el.classList.add('selected');
    }
    
    updateSelectedCount();
}

/**
 * Load models vào dropdown trong setup modal
 * Load models into setup modal dropdown
 */
async function loadSetupModels() {
    try {
        const models = await fetchModels();
        const select = document.getElementById('setupModel');
        if (select && models.length > 0) {
            select.innerHTML = '';
            const currentModel = getModel();
            models.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                if (name === currentModel) option.selected = true;
                select.appendChild(option);
            });
        }
    } catch (e) {
        console.error('Failed to load models:', e);
    }
}

/**
 * Hiển thị setup phân tích
 * Show analysis setup
 * @param {string} displayName - Player display name
 */
export function showAnalysisSetup(displayName) {
    const data = profileDataStore[displayName];
    if (!data) {
        alert('❌ No data! Refresh first.');
        return;
    }
    
    if (!hasApiKey()) {
        alert('❌ Set API key first!');
        openSettingsModal();
        return;
    }

    currentPlayer = displayName;
    selectedMatches = [];
    analysisMode = 'all';

    const matches = data.matches || [];
    const name = data.summoner?.riot_id || displayName;
    const rank = data.ranked?.rating_text || 'Unranked';

    // Build match grid HTML
    let gridHTML = '';
    matches.forEach((m, i) => {
        const p = m.placement;
        const color = getPlacementHexColor(p);
        gridHTML += `
            <div class="match-grid-item" data-idx="${i}" onclick="window.analysisModule.toggleMatch(${i})">
                <div class="p" style="background:${color}">${p}</div>
                <div class="info">#${i + 1}</div>
            </div>
        `;
    });

    const content = document.getElementById('analysisContent');
    content.innerHTML = `
        <div class="player-header"><strong>${name}</strong> - ${rank} (${matches.length} games)</div>
        <div class="form-group">
            <label>Model:</label>
            <select id="setupModel"><option value="${getModel()}">${getModel()}</option></select>
        </div>
        <label style="font-weight:600;">Select matches:</label>
        <div class="match-options">
            <div class="match-option active" onclick="window.analysisModule.setMode('all', this)">All (max 20)</div>
            <div class="match-option" onclick="window.analysisModule.setMode('top10', this)">Top 10</div>
            <div class="match-option" onclick="window.analysisModule.setMode('select', this)">Select</div>
        </div>
        <div id="matchGridWrap" style="display:none;">
            <div class="match-grid">${gridHTML}</div>
            <p id="selectedCount" style="font-size:0.8rem;color:#667eea;margin-top:8px;">Selected: 0</p>
        </div>
        <button class="btn" onclick="window.analysisModule.startAnalysis()" style="margin-top:20px;">🚀 Start Analysis</button>
    `;

    loadSetupModels();
    openModal('analysisModal');
}

/**
 * Bắt đầu phân tích
 * Start analysis
 */
export async function startAnalysis() {
    const data = profileDataStore[currentPlayer];
    const model = document.getElementById('setupModel')?.value || getModel();
    const matches = getMatchesToAnalyze(data);
    
    if (!matches.length) {
        alert('❌ Select at least 1 match!');
        return;
    }

    const content = document.getElementById('analysisContent');
    content.innerHTML = `
        <div style="text-align:center;padding:40px;">
            <div class="spinner"></div>
            <p>🤖 Analyzing ${matches.length} games...</p>
            <p style="color:#718096;font-size:0.9rem;">Model: ${model}</p>
        </div>
    `;

    try {
        const prompt = buildPrompt(data, matches, currentPlayer);
        const result = await callGeminiAPI(prompt, model);
        const name = data.summoner?.riot_id || currentPlayer;
        const rank = data.ranked?.rating_text || 'Unranked';
        content.innerHTML = formatAnalysisResult(result, name, rank, matches.length, currentPlayer);
    } catch (e) {
        const escapedPlayer = currentPlayer.replace(/'/g, "\\'");
        content.innerHTML = `
            <button class="btn btn-secondary" onclick="window.analysisModule.showAnalysisSetup('${escapedPlayer}')">← Back</button>
            <div class="analysis-error">
                <h3>❌ Error</h3>
                <p>${e.message}</p>
            </div>
        `;
    }
}

/**
 * Reset state khi đóng modal
 * Reset state when closing modal
 */
export function resetAnalysisState() {
    currentPlayer = null;
    selectedMatches = [];
    analysisMode = 'all';
}

// Export để dùng globally / Export for global use
export const analysisModule = {
    showAnalysisSetup,
    startAnalysis,
    setMode,
    toggleMatch,
    resetAnalysisState
};
