/**
 * Constants Configuration
 * Chứa danh sách người chơi và các endpoint API
 * Contains player list and API endpoints
 */

// Danh sách người chơi cố định / Hardcoded list of IGNs
// Format: { region, gameName, tagLine, displayName }
export const IGN_LIST = [
    {
        region: 'VN2',
        gameName: 'M%E1%BA%ADp%20M%C4%83m%20M%C4%83m', // Mập Măm Măm
        tagLine: 'Pici0',
        displayName: 'Mập Măm Măm#Pici0'
    },
    {
        region: 'VN2',
        gameName: 'Guen%20Mori', // Guen Mori
        tagLine: 'vn2',
        displayName: 'Guen Mori#vn2'
    },
    {
        region: 'VN2',
        gameName: 'Halcyon',
        tagLine: '1621',
        displayName: 'Halcyon#1621'
    },
    {
        region: 'VN2',
        gameName: 'Yuki%20Apollo', // Yuki Apollo
        tagLine: 'vn2',
        displayName: 'Yuki Apollo#vn2'
    },
    {
        region: 'VN2',
        gameName: 'Musashi%20Shao', // Musashi Shao
        tagLine: 'shao',
        displayName: 'Musashi Shao#shao'
    },
    {
        region: 'VN2',
        gameName: 'Nguy%E1%BB%87tTh%E1%BB%B1cAsura', // NguyệtThựcAsura
        tagLine: '0211',
        displayName: 'NguyệtThựcAsura#0211'
    },
    {
        region: 'VN2',
        gameName: 'Untitled', // Untitled
        tagLine: '0610',
        displayName: 'Untitled#0610'
    },
    {
        region: 'VN2',
        gameName: 'EthanDoan', // EthanDoan
        tagLine: '1212',
        displayName: 'EthanDoan#1212'
    }
];

// API Endpoints
export const API_BASE_URL = 'https://api.metatft.com/public/profile';
export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';

// TFT Set hiện tại / Current TFT Set
export const CURRENT_TFT_SET = 'TFTSet16';

// ============================================
// RIOT API CONFIGURATION
// ============================================

/**
 * Riot API Regional Routing
 * Mỗi region sẽ map đến một regional endpoint
 * Each region maps to a regional endpoint
 */
export const RIOT_REGIONS = {
    // Platform routing values (for summoner/league APIs)
    PLATFORMS: {
        'VN2': 'vn2',
        'BR1': 'br1',
        'EUN1': 'eun1',
        'EUW1': 'euw1',
        'JP1': 'jp1',
        'KR': 'kr',
        'LA1': 'la1',
        'LA2': 'la2',
        'NA1': 'na1',
        'OC1': 'oc1',
        'PH2': 'ph2',
        'RU': 'ru',
        'SG2': 'sg2',
        'TH2': 'th2',
        'TR1': 'tr1',
        'TW2': 'tw2'
    },
    // Regional routing values (for account/match APIs)
    // Note: SEA platforms (VN2, PH2, SG2, TH2, TW2) use 'asia' for account-v1
    REGIONALS: {
        'VN2': 'asia',
        'PH2': 'asia',
        'SG2': 'asia',
        'TH2': 'asia',
        'TW2': 'asia',
        'BR1': 'americas',
        'LA1': 'americas',
        'LA2': 'americas',
        'NA1': 'americas',
        'OC1': 'americas',
        'EUN1': 'europe',
        'EUW1': 'europe',
        'RU': 'europe',
        'TR1': 'europe',
        'JP1': 'asia',
        'KR': 'asia'
    }
};

/**
 * Build Riot API URL cho platform endpoints
 * Build Riot API URL for platform endpoints (summoner, league)
 * @param {string} region - Region code (e.g., 'VN2')
 * @param {string} endpoint - API endpoint path
 * @returns {string} Full API URL
 */
export function buildRiotPlatformUrl(region, endpoint) {
    const platform = RIOT_REGIONS.PLATFORMS[region] || region.toLowerCase();
    return `https://${platform}.api.riotgames.com${endpoint}`;
}

/**
 * Build Riot API URL cho regional endpoints
 * Build Riot API URL for regional endpoints (account, match)
 * @param {string} region - Region code (e.g., 'VN2')
 * @param {string} endpoint - API endpoint path
 * @returns {string} Full API URL
 */
export function buildRiotRegionalUrl(region, endpoint) {
    const regional = RIOT_REGIONS.REGIONALS[region] || 'sea';
    return `https://${regional}.api.riotgames.com${endpoint}`;
}

/**
 * Xây dựng URL API cho một người chơi
 * Build API URL for a player
 * @param {Object} ign - Player info object
 * @returns {string} Full API URL
 */
export function buildApiUrl(ign) {
    return `${API_BASE_URL}/lookup_by_riotid/${ign.region}/${ign.gameName}/${ign.tagLine}?source=full_profile&tft_set=${CURRENT_TFT_SET}`;
}
