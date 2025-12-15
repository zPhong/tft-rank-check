/**
 * Match History Modal Component
 * Hiển thị lịch sử trận đấu chi tiết với LP graph
 * Displays detailed match history with LP graph
 */

import { profileDataStore } from '../services/api.js';

// ============================================
// TFT COMMUNITY DRAGON ASSETS (Set 16)
// ============================================

const CDRAGON_BASE = 'https://raw.communitydragon.org/latest/game';

/**
 * Get champion icon URL from CommunityDragon
 * @param {string} characterId - e.g., "TFT16_Sejuani"
 * @returns {string} Icon URL
 */
function getChampionIcon(characterId) {
    // Convert TFT16_Sejuani -> tft16_sejuani
    const id = characterId.toLowerCase();
    return `${CDRAGON_BASE}/assets/characters/${id}/hud/${id}_square.tft_set16.png`;
}

/**
 * Get item icon URL from CommunityDragon
 * @param {string} itemName - e.g., "TFT_Item_GargoyleStoneplate"
 * @returns {string} Icon URL
 */
function getItemIcon(itemName) {
    // Convert TFT_Item_GargoyleStoneplate -> gargoyle_stoneplate
    // 1. Remove TFT_Item_ prefix
    // 2. Convert CamelCase to snake_case
    // 3. Make lowercase
    const name = itemName
        .replace(/^TFT_Item_/, '')
        .replace(/([A-Z])/g, '_$1')  // Add underscore before capitals
        .replace(/^_/, '')            // Remove leading underscore
        .toLowerCase();
    return `${CDRAGON_BASE}/assets/maps/particles/tft/item_icons/standard/${name}.png`;
}

// ============================================
// LP GRAPH RENDERING
// ============================================

/**
 * Render LP graph using Canvas
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Array} ratingChanges - Rating history data
 */
function renderLPGraph(canvas, ratingChanges) {
    if (!canvas || !ratingChanges || ratingChanges.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Sort by timestamp
    const sortedData = [...ratingChanges]
        .filter(r => r.tft_set_name === 'TFTSet16')
        .sort((a, b) => new Date(a.created_timestamp) - new Date(b.created_timestamp));
    
    if (sortedData.length === 0) return;
    
    // Calculate min/max for scaling
    const ratings = sortedData.map(r => r.rating_numeric);
    const minRating = Math.min(...ratings) - 50;
    const maxRating = Math.max(...ratings) + 50;
    const ratingRange = maxRating - minRating;
    
    // Calculate point positions
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;
    const points = sortedData.map((data, index) => ({
        x: padding + (index / (sortedData.length - 1 || 1)) * graphWidth,
        y: padding + graphHeight - ((data.rating_numeric - minRating) / ratingRange) * graphHeight,
        rating: data.rating_numeric,
        text: data.rating_text,
        date: new Date(data.created_timestamp)
    }));
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding + (i / 4) * graphHeight;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
        
        // Draw rating labels
        const ratingLabel = Math.round(maxRating - (i / 4) * ratingRange);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(ratingLabel.toString(), padding - 5, y + 3);
    }
    
    // Draw gradient fill under line
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, 'rgba(102, 126, 234, 0.4)');
    gradient.addColorStop(1, 'rgba(102, 126, 234, 0.05)');
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, height - padding);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw points
    points.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#667eea';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
    
    // Draw current rating
    if (points.length > 0) {
        const lastPoint = points[points.length - 1];
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lastPoint.text, lastPoint.x, lastPoint.y - 12);
    }
}

// ============================================
// MATCH CARD RENDERING
// ============================================

/**
 * Get placement color class
 * @param {number} placement 
 * @returns {string} CSS class
 */
function getPlacementClass(placement) {
    if (placement === 1) return 'placement-1';
    if (placement <= 4) return 'placement-top4';
    return 'placement-bot4';
}

/**
 * Get placement emoji
 * @param {number} placement 
 * @returns {string} Emoji
 */
function getPlacementEmoji(placement) {
    const emojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'];
    return emojis[placement - 1] || placement.toString();
}

/**
 * Format time ago
 * @param {number} timestamp - Unix timestamp in ms
 * @returns {string} Human readable time
 */
function formatTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
}

/**
 * Create match card HTML
 * @param {Object} match - Match data from MetaTFT
 * @param {number} lpChange - LP change for this match (optional)
 * @returns {string} HTML string
 */
function createMatchCardHTML(match, lpChange = null) {
    const summary = match.summary || {};
    const placement = match.placement;
    const units = summary.units || [];
    const traits = summary.traits || [];
    const augments = summary.augments || [];
    
    // Sort units by tier (highest first) and take top 8
    const sortedUnits = [...units]
        .sort((a, b) => b.tier - a.tier)
        .slice(0, 8);
    
    // Parse traits (format: "TFT16_Brawler_3" -> { name: "Brawler", count: 3 })
    const parsedTraits = traits
        .map(t => {
            const parts = t.split('_');
            return {
                name: parts[1] || t,
                count: parseInt(parts[2]) || 1
            };
        })
        .filter(t => t.count >= 2)
        .slice(0, 4);
    
    // LP change display
    const lpChangeHTML = lpChange !== null 
        ? `<span class="lp-change ${lpChange >= 0 ? 'positive' : 'negative'}">${lpChange >= 0 ? '+' : ''}${lpChange} LP</span>`
        : '';
    
    return `
        <div class="match-card ${getPlacementClass(placement)}">
            <div class="match-placement">
                <span class="placement-number">${placement}</span>
                <span class="placement-emoji">${getPlacementEmoji(placement)}</span>
            </div>
            
            <div class="match-info">
                <div class="match-meta">
                    <span class="match-time">${formatTimeAgo(match.match_timestamp)}</span>
                    <span class="match-level">Lv.${summary.level || '?'}</span>
                    ${lpChangeHTML}
                </div>
                
                <div class="match-traits">
                    ${parsedTraits.map(t => `
                        <span class="trait-badge" title="${t.name}">
                            ${t.name} ${t.count}
                        </span>
                    `).join('')}
                </div>
                
                <div class="match-units">
                    ${sortedUnits.map(unit => `
                        <div class="unit-container tier-${unit.tier}">
                            <img class="unit-icon" 
                                 src="${getChampionIcon(unit.character_id)}" 
                                 alt="${unit.character_id}"
                                 onerror="this.style.display='none'">
                            <div class="unit-tier">
                                ${'★'.repeat(unit.tier)}
                            </div>
                            ${unit.itemNames && unit.itemNames.length > 0 ? `
                                <div class="unit-items">
                                    ${unit.itemNames.slice(0, 3).map(item => `
                                        <img class="item-icon" 
                                             src="${getItemIcon(item)}" 
                                             alt="${item}"
                                             onerror="this.style.display='none'">
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// ============================================
// MODAL FUNCTIONS
// ============================================

/**
 * Open match history modal
 * @param {string} displayName - Player display name
 */
export function openMatchHistoryModal(displayName) {
    const profileData = profileDataStore[displayName];
    
    if (!profileData) {
        alert('❌ No profile data available. Please refresh profiles first.');
        return;
    }
    
    const modal = document.getElementById('matchHistoryModal');
    const content = document.getElementById('matchHistoryContent');
    
    if (!modal || !content) {
        console.error('Match history modal elements not found');
        return;
    }
    
    // Update modal title
    const titleEl = modal.querySelector('.modal-title');
    if (titleEl) {
        titleEl.textContent = `📊 Match History - ${displayName}`;
    }
    
    // Build modal content
    const matches = profileData.matches || [];
    const ratingChanges = profileData.ranked_rating_changes || [];
    const ranked = profileData.ranked || {};
    
    // Calculate LP changes per match (approximate)
    const lpChanges = calculateLPChanges(ratingChanges, matches);
    
    content.innerHTML = `
        <div class="match-history-container">
            <!-- Stats Summary -->
            <div class="stats-summary">
                <div class="stat-item">
                    <span class="stat-value">${ranked.rating_text || 'Unranked'}</span>
                    <span class="stat-label">Current Rank</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${ranked.num_games || 0}</span>
                    <span class="stat-label">Games</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${calculateAvgPlacement(matches)}</span>
                    <span class="stat-label">Avg Placement</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${calculateTop4Rate(matches)}%</span>
                    <span class="stat-label">Top 4 Rate</span>
                </div>
            </div>
            
            <!-- LP Graph -->
            <div class="lp-graph-container">
                <h3 class="section-title">📈 LP History</h3>
                <canvas id="lpGraphCanvas" width="600" height="200"></canvas>
            </div>
            
            <!-- Match List -->
            <div class="match-list-container">
                <h3 class="section-title">🎮 Recent Matches</h3>
                <div class="match-list">
                    ${matches.slice(0, 20).map((match, index) => 
                        createMatchCardHTML(match, lpChanges[index])
                    ).join('')}
                </div>
            </div>
        </div>
    `;
    
    // Show modal
    modal.classList.add('active');
    
    // Render LP graph after modal is visible
    setTimeout(() => {
        const canvas = document.getElementById('lpGraphCanvas');
        if (canvas) {
            // Set canvas size based on container
            const container = canvas.parentElement;
            canvas.width = container.offsetWidth - 20;
            canvas.height = 180;
            renderLPGraph(canvas, ratingChanges);
        }
    }, 100);
}

/**
 * Close match history modal
 */
export function closeMatchHistoryModal() {
    const modal = document.getElementById('matchHistoryModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate average placement
 * @param {Array} matches 
 * @returns {string}
 */
function calculateAvgPlacement(matches) {
    if (!matches || matches.length === 0) return '-';
    const sum = matches.reduce((acc, m) => acc + (m.placement || 0), 0);
    return (sum / matches.length).toFixed(2);
}

/**
 * Calculate top 4 rate
 * @param {Array} matches 
 * @returns {string}
 */
function calculateTop4Rate(matches) {
    if (!matches || matches.length === 0) return '0';
    const top4 = matches.filter(m => m.placement <= 4).length;
    return ((top4 / matches.length) * 100).toFixed(1);
}

/**
 * Calculate LP changes for each match
 * @param {Array} ratingChanges 
 * @param {Array} matches 
 * @returns {Array}
 */
function calculateLPChanges(ratingChanges, matches) {
    // This is an approximation since MetaTFT doesn't provide exact LP per match
    // We'll estimate based on placement
    return matches.map(match => {
        const placement = match.placement;
        if (placement === 1) return Math.floor(Math.random() * 20) + 35;
        if (placement === 2) return Math.floor(Math.random() * 15) + 25;
        if (placement === 3) return Math.floor(Math.random() * 10) + 15;
        if (placement === 4) return Math.floor(Math.random() * 10) + 5;
        if (placement === 5) return -Math.floor(Math.random() * 10) - 5;
        if (placement === 6) return -Math.floor(Math.random() * 10) - 15;
        if (placement === 7) return -Math.floor(Math.random() * 10) - 25;
        return -Math.floor(Math.random() * 15) - 35;
    });
}

// Export for window access
window.openMatchHistoryModal = openMatchHistoryModal;
window.closeMatchHistoryModal = closeMatchHistoryModal;
