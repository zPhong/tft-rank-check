/**
 * MetaTFT API Service
 * Xử lý các cuộc gọi API đến MetaTFT
 * Handles API calls to MetaTFT
 */

import { buildApiUrl } from '../config/constants.js';

// Store để lưu trữ dữ liệu profile cho AI analysis
// Store to save profile data for AI analysis
export const profileDataStore = {};

/**
 * Fetch profile từ MetaTFT API
 * Fetch profile from MetaTFT API
 * @param {Object} ign - Player info object { region, gameName, tagLine, displayName }
 * @returns {Promise<Object>} Result object { success, data?, error?, ign }
 */
export async function fetchProfile(ign) {
    const apiUrl = buildApiUrl(ign);
    
    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Lưu data vào store để dùng cho AI analysis
        // Save data to store for AI analysis
        profileDataStore[ign.displayName] = data;
        
        return { success: true, data, ign };
    } catch (error) {
        return { success: false, error: error.message, ign };
    }
}

/**
 * Tính toán thống kê từ các profiles
 * Calculate statistics from profiles
 * @param {Array} profiles - Array of profile results
 * @returns {Object} Statistics object
 */
export function calculateStats(profiles) {
    const successful = profiles.filter(p => p.success && p.data);
    const total = successful.length;

    if (total === 0) {
        return {
            totalProfiles: profiles.length,
            avgRating: 0,
            highestRank: '-',
            totalGames: 0
        };
    }

    const ratings = successful
        .map(p => p.data.ranked?.rating_numeric)
        .filter(r => r !== undefined && r !== null);

    const avgRating = ratings.length > 0
        ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length)
        : 0;

    const highestRating = Math.max(...ratings, 0);
    const highestProfile = successful.find(p =>
        p.data.ranked?.rating_numeric === highestRating
    );
    const highestRank = highestProfile?.data.ranked?.rating_text || '-';

    const totalGames = successful.reduce((sum, p) =>
        sum + (p.data.ranked?.num_games || 0), 0
    );

    return {
        totalProfiles: profiles.length,
        avgRating,
        highestRank,
        totalGames
    };
}
