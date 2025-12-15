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

// API Endpoints (MetaTFT only)
export const API_BASE_URL = 'https://api.metatft.com/public/profile';
export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';

// TFT Set hiện tại / Current TFT Set
export const CURRENT_TFT_SET = 'TFTSet16';

/**
 * Xây dựng URL API cho một người chơi
 * Build API URL for a player
 * @param {Object} ign - Player info object
 * @returns {string} Full API URL
 */
export function buildApiUrl(ign) {
    return `${API_BASE_URL}/lookup_by_riotid/${ign.region}/${ign.gameName}/${ign.tagLine}?source=full_profile&tft_set=${CURRENT_TFT_SET}`;
}
