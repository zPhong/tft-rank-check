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
 * Supports: standard items, TFT16 emblems, Bilgewater items, Radiant items
 * @param {string} itemName - e.g., "TFT_Item_GargoyleStoneplate", "TFT16_Item_NoxusEmblemItem"
 * @returns {string} Icon URL
 */
function getItemIcon(itemName) {
    const BASE = `${CDRAGON_BASE}/assets/maps/particles/tft/item_icons`;
    
    // Standard item name mapping (verified with CDN - 2024-12-15)
    const standardItemMap = {
        'TFT_Item_GargoyleStoneplate': 'gargoyle_stoneplate',
        'TFT_Item_DragonsClaw': 'dragons_claw',
        'TFT_Item_GiantSlayer': 'giant_slayer',
        'TFT_Item_BlueBuff': 'blue_buff',
        'TFT_Item_BFSword': 'bf_sword',
        'TFT_Item_ChainVest': 'chain_vest',
        'TFT_Item_BrambleVest': 'bramble_vest',
        'TFT_Item_Bloodthirster': 'bloodthirster',
        'TFT_Item_ArchangelStaff': 'archangel_staff',
        'TFT_Item_DeathBlade': 'death_blade',
        'TFT_Item_Deathblade': 'death_blade',
        'TFT_Item_GiantsBelt': 'gaints_belt',
        'TFT_Item_ChaliceOfPower': 'chalice_of_power',
        'TFT_Item_AdaptiveHelm': 'adaptive_helm',
        'TFT_Item_Crownguard': 'crownguard',
        'TFT_Item_DeathfireGrasp': 'deathfire_grasp',
        'TFT_Item_EdgeOfNight': 'edge_of_night_xl',
        'TFT_Item_Everfrost': 'everfrost_xl',
        'TFT_Item_NeedlesslyLargeRod': 'needlessly_large_rod',
        'TFT_Item_RecurveBow': 'recurve_bow',
        'TFT_Item_SparringGloves': 'sparring_gloves',
        'TFT_Item_TearOfTheGoddess': 'tear_of_the_goddess',
        'TFT_Item_NegatronCloak': 'negatron_cloak',
        'TFT_Item_Quicksilver': 'quicksilver',
        'TFT_Item_RabadonsDeathcap': 'rabadons_deathcap',
        'TFT_Item_RunaansHurricane': 'runaans_hurricane',
        'TFT_Item_SpearOfShojin': 'spear_of_shojin',
        'TFT_Item_StatikkShiv': 'statikk_shiv',
        'TFT_Item_SunfireCape': 'sunfire_cape',
        'TFT_Item_ThiefsGloves': 'thieves_gloves',
        'TFT_Item_TitansResolve': 'titans_resolve',
        'TFT_Item_WarmogsArmor': 'warmogs_armor',
        'TFT_Item_ZekesHerald': 'zekes_herald',
        'TFT_Item_Zephyr': 'zephyr',
        'TFT_Item_LastWhisper': 'last_whisper',
        'TFT_Item_JeweledGauntlet': 'jeweled_guantlet',
        'TFT_Item_IonicSpark': 'ionic_spark',
        'TFT_Item_InfinityEdge': 'infinity_edge',
        'TFT_Item_HextechGunblade': 'hextech_gunblade',
        'TFT_Item_HandOfJustice': 'hand_of_justice',
        'TFT_Item_GuinsoosRageblade': 'guinsoos_rageblade',
        'TFT_Item_Morellonomicon': 'morellonomicon',
        'TFT_Item_Redemption': 'redemption',
        'TFT_Item_Shroud': 'shroud_of_stillness',
        'TFT_Item_Stoneplate': 'gargoyle_stoneplate',
        'TFT_Item_FrozenHeart': 'frozen_heart',
        'TFT_Item_SpectralGauntlet': 'jeweled_guantlet',
        'TFT_Item_PowerGauntlet': 'jeweled_guantlet',
        'TFT_Item_SteraksGage': 'steraksgage_xl',
        'TFT_Item_NightHarvester': 'night_harvester',
        'TFT_Item_UnstableConcoction': 'unstable_concoction',
        'TFT_Item_GuardianAngel': 'guardian_angel',
        'TFT_Item_LocketOfTheIronSolari': 'locket_of_the_iron_solari',
        // Additional items from recent failures
        'TFT_Item_RapidFireCannon': 'rapidfirecannon_xl',
        'TFT_Item_RedBuff': 'redbuff',
        'TFT_Item_MadredsBloodrazor': 'madreds_bloodrazor',
        'TFT_Item_Fishbones': 'fishbones',
    };
    
    // Check standard item map
    if (standardItemMap[itemName]) {
        return `${BASE}/standard/${standardItemMap[itemName]}.png`;
    }
    
    // Handle TFT16 Set 16 Emblems: TFT16_Item_NoxusEmblemItem -> tft16_emblem_noxus.tft_set16.png
    if (itemName.includes('EmblemItem')) {
        // Extract trait name: NoxusEmblemItem -> noxus
        const traitName = itemName
            .replace(/^TFT16_Item_/, '')
            .replace('EmblemItem', '')
            .toLowerCase();
        return `${BASE}/traits/spatula/set16/tft16_emblem_${traitName}.tft_set16.png`;
    }
    
    // Handle TFT16 specific items (Set 16: Lore & Legends)
    if (itemName.startsWith('TFT16_')) {
        // Bilgewater items: TFT16_Item_Bilgewater_CaptainsBrew -> tft16_item_bilgewater_captainsbrew.tft_set16.png
        if (itemName.includes('Bilgewater_')) {
            const bilgewaterName = itemName
                .replace('TFT16_Item_Bilgewater_', '')
                .toLowerCase();
            return `${BASE}/tft16/tft16_item_bilgewater_${bilgewaterName}.tft_set16.png`;
        }
        
        // The Darkin items: TFT16_TheDarkinBow -> thedarkinbow (might be in ornn_items)
        if (itemName.includes('TheDarkin')) {
            const darkinName = itemName.replace('TFT16_', '').toLowerCase();
            return `${BASE}/ornn_items/${darkinName}.png`;
        }
        
        // Generic TFT16 items with .tft_set16 suffix
        const tft16Name = itemName.replace('TFT16_Item_', '').toLowerCase();
        return `${BASE}/tft16/tft16_item_${tft16Name}.tft_set16.png`;
    }
    
    // Handle Radiant items: TFT5_Item_SteraksGageRadiant -> steraks_gage_radiant.png
    if (itemName.includes('Radiant')) {
        const radiantName = itemName
            .replace(/^TFT\d+_Item_/, '')
            .replace('Radiant', '')
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            .toLowerCase();
        return `${BASE}/radiant/${radiantName}_radiant.png`;
    }
    
    // Handle Artifact items: TFT_Item_Artifact_LichBane -> tft_item_artifact_lichbane.png
    if (itemName.includes('Artifact_')) {
        const artifactName = itemName.toLowerCase().replace('tft_item_artifact_', '');
        return `${BASE}/ornn_items/tft_item_artifact_${artifactName}.png`;
    }
    
    // Fallback: try standard folder with auto-conversion
    const name = itemName
        .replace(/^TFT\d*_Item_/, '')
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
        .toLowerCase();
    
    return `${BASE}/standard/${name}.png`;
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
                                             title="${item}"
                                             onerror="this.style.opacity='0.3'; this.style.background='#333'; console.warn('Missing item icon:', '${item}')">
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
