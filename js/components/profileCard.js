/**
 * Profile Card Component
 * Tạo và render các thẻ profile
 * Creates and renders profile cards
 */

import { getPlacementColor, formatDate, escapeQuotes } from '../utils/helpers.js';

/**
 * Tạo HTML cho profile card
 * Create HTML for profile card
 * @param {Object} profileData - Profile data object { data, ign }
 * @returns {HTMLElement} Profile card element
 */
export function createProfileCard(profileData) {
    const { data, ign } = profileData;
    const card = document.createElement('div');
    card.className = 'profile-card';

    const ignText = data.summoner?.riot_id || ign.displayName || 'N/A';
    const rankText = data.ranked?.rating_text || 'N/A';
    const numGames = data.ranked?.num_games || 0;
    const ratingNumeric = data.ranked?.rating_numeric || 0;

    // Generate games history HTML
    let gamesHistoryHTML = '';
    if (data.matches && data.matches.length > 0) {
        const last20Matches = data.matches.slice(0, 20);
        gamesHistoryHTML = `
            <div class="games-history">
                <div class="games-history-title">Last 20 Games</div>
                <div class="games-list">
                    ${last20Matches.map((match) => {
                        const placement = match.placement;
                        if (typeof placement !== 'number') return '';

                        const placementColor = getPlacementColor(placement);
                        const date = match.game_datetime ? new Date(match.game_datetime) : null;
                        const dateStr = date ? formatDate(date) : '';

                        return `
                            <div class="game-item">
                                <div class="game-info">
                                    <div class="placement-block ${placementColor}">
                                        ${placement}
                                    </div>
                                    ${dateStr ? `<div class="game-meta">${dateStr}</div>` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    } else {
        gamesHistoryHTML = `
            <div class="games-history">
                <div class="games-history-title">Last 20 Games</div>
                <div class="games-list" style="text-align: center; color: rgba(255, 255, 255, 0.7); padding: 10px 0; font-size: 0.7rem;">
                    No games
                </div>
            </div>
        `;
    }

    const escapedDisplayName = escapeQuotes(ign.displayName);

    card.innerHTML = `
        <div class="profile-header">
            <div class="profile-icon">👤</div>
            <div class="profile-header-info">
                <div class="profile-name-row">
                    <span class="ign">${ignText}</span>
                    <div class="action-buttons">
                        <button class="analyze-btn" onclick="window.analysisModule.showAnalysisSetup('${escapedDisplayName}')">🤖 AI</button>
                        <button class="history-btn" onclick="window.openMatchHistoryModal('${escapedDisplayName}')">📊 History</button>
                    </div>
                </div>
                <div class="rank-value">${rankText}</div>
                <div class="header-stats">
                    <div class="header-stat">
                        <span class="header-stat-label">Games:</span>
                        <span class="header-stat-value">${numGames}</span>
                    </div>
                    <div class="header-stat">
                        <span class="header-stat-label">Rating:</span>
                        <span class="header-stat-value">${ratingNumeric}</span>
                    </div>
                </div>
            </div>
            <div class="profile-header-games">
                ${gamesHistoryHTML}
            </div>
        </div>
    `;

    return card;
}

/**
 * Tạo HTML cho error card
 * Create HTML for error card
 * @param {Object} ign - Player info object
 * @param {string} error - Error message
 * @returns {HTMLElement} Error card element
 */
export function createErrorCard(ign, error) {
    const card = document.createElement('div');
    card.className = 'profile-card';
    card.innerHTML = `
        <div class="profile-icon">❌</div>
        <div class="ign">${ign.displayName}</div>
        <div class="rank-section">
            <div class="rank-label">Error</div>
            <div class="rank-value" style="color: #e53e3e; font-size: 1rem;">${error}</div>
        </div>
    `;
    return card;
}
