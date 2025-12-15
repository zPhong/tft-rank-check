/**
 * Riot Games TFT API Service
 * Xử lý các cuộc gọi API đến Riot Games
 * Handles API calls to Riot Games TFT API
 */

import { RIOT_REGIONS } from '../config/constants.js';
import { getRiotApiKey } from '../config/settings.js';

// Store để lưu trữ dữ liệu profile cho AI analysis
// Store to save profile data for AI analysis
export const riotProfileDataStore = {};

// ============================================
// PROXY CONFIGURATION
// ============================================

// Use local proxy to bypass CORS
const PROXY_BASE_URL = 'http://localhost:3001/riot-proxy';
const USE_PROXY = true; // Set to false if running with backend

/**
 * Build URL cho proxy hoặc direct API
 * Build URL for proxy or direct API
 * @param {string} region - Region code (platform or regional)
 * @param {string} endpoint - API endpoint
 * @param {boolean} isRegional - True for regional endpoints (account, match)
 * @returns {string} Full URL
 */
function buildProxyUrl(region, endpoint, isRegional = false) {
    if (USE_PROXY) {
        // Route qua proxy server
        const routeRegion = isRegional 
            ? (RIOT_REGIONS.REGIONALS[region] || 'sea')
            : (RIOT_REGIONS.PLATFORMS[region] || region.toLowerCase());
        return `${PROXY_BASE_URL}/${routeRegion}${endpoint}`;
    } else {
        // Direct API call (chỉ dùng với backend)
        const baseUrl = isRegional
            ? `https://${RIOT_REGIONS.REGIONALS[region] || 'sea'}.api.riotgames.com`
            : `https://${RIOT_REGIONS.PLATFORMS[region] || region.toLowerCase()}.api.riotgames.com`;
        return `${baseUrl}${endpoint}`;
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Tạo headers cho Riot API request
 * Create headers for Riot API request
 * @returns {Object} Headers object
 */
function getHeaders() {
    const apiKey = getRiotApiKey();
    if (!apiKey) {
        throw new Error('Riot API key not configured. Please add your API key in Settings.');
    }
    return {
        'X-Riot-Token': apiKey,
        'Accept': 'application/json'
    };
}

/**
 * Fetch wrapper với error handling
 * Fetch wrapper with error handling
 * @param {string} url - API URL
 * @returns {Promise<Object>} Response data
 */
async function riotFetch(url) {
    try {
        const response = await fetch(url, { headers: getHeaders() });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            switch (response.status) {
                case 401:
                    throw new Error('Invalid API key. Please check your Riot API key.');
                case 403:
                    throw new Error('API key expired or forbidden. Please regenerate your key.');
                case 404:
                    throw new Error('Summoner not found.');
                case 429:
                    throw new Error('Rate limit exceeded. Please wait and try again.');
                case 500:
                    if (errorData.error?.includes('CORS')) {
                        throw new Error('CORS error. Please ensure proxy server is running.');
                    }
                    throw new Error(errorData.error || `Server error ${response.status}`);
                default:
                    throw new Error(errorData.status?.message || errorData.error || `HTTP error ${response.status}`);
            }
        }
        
        return await response.json();
    } catch (error) {
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            throw new Error('Cannot connect to proxy. Run: npm install && npm run proxy');
        }
        throw error;
    }
}

// ============================================
// ACCOUNT API (Regional endpoints)
// ============================================

/**
 * Lấy account info bằng Riot ID (gameName#tagLine)
 * Get account info by Riot ID
 * @param {string} gameName - Game name (e.g., "Mập Măm Măm")
 * @param {string} tagLine - Tag line (e.g., "Pici0")
 * @param {string} region - Region code (e.g., "VN2")
 * @returns {Promise<Object>} Account data { puuid, gameName, tagLine }
 */
export async function getAccountByRiotId(gameName, tagLine, region = 'VN2') {
    const encodedName = encodeURIComponent(gameName);
    const encodedTag = encodeURIComponent(tagLine);
    const endpoint = `/riot/account/v1/accounts/by-riot-id/${encodedName}/${encodedTag}`;
    const url = buildProxyUrl(region, endpoint, true); // Regional endpoint
    
    return await riotFetch(url);
}

// ============================================
// TFT SUMMONER API (Platform endpoints)
// ============================================

/**
 * Lấy summoner info bằng PUUID
 * Get summoner info by PUUID
 * @param {string} puuid - Player UUID
 * @param {string} region - Region code
 * @returns {Promise<Object>} Summoner data
 */
export async function getSummonerByPuuid(puuid, region = 'VN2') {
    const endpoint = `/tft/summoner/v1/summoners/by-puuid/${puuid}`;
    const url = buildProxyUrl(region, endpoint, false); // Platform endpoint
    
    return await riotFetch(url);
}

// ============================================
// TFT LEAGUE API (Platform endpoints)
// ============================================

/**
 * Lấy thông tin xếp hạng TFT của người chơi
 * Get TFT ranked info for a player
 * @param {string} summonerId - Summoner ID
 * @param {string} region - Region code
 * @returns {Promise<Array>} League entries array
 */
export async function getTftLeagueEntries(summonerId, region = 'VN2') {
    const endpoint = `/tft/league/v1/entries/by-summoner/${summonerId}`;
    const url = buildProxyUrl(region, endpoint, false); // Platform endpoint
    
    return await riotFetch(url);
}

/**
 * Lấy thông tin xếp hạng TFT bằng PUUID
 * Get TFT ranked info by PUUID
 * @param {string} puuid - Player UUID
 * @param {string} region - Region code
 * @returns {Promise<Array>} League entries array
 */
export async function getTftLeagueByPuuid(puuid, region = 'VN2') {
    const endpoint = `/tft/league/v1/entries/by-puuid/${puuid}`;
    const url = buildProxyUrl(region, endpoint, false); // Platform endpoint
    
    return await riotFetch(url);
}

// ============================================
// TFT MATCH API (Regional endpoints)
// ============================================

/**
 * Lấy danh sách match IDs
 * Get list of match IDs
 * @param {string} puuid - Player UUID
 * @param {string} region - Region code
 * @param {number} count - Number of matches to retrieve (default 20)
 * @returns {Promise<Array>} Array of match IDs
 */
export async function getTftMatchIds(puuid, region = 'VN2', count = 20) {
    const endpoint = `/tft/match/v1/matches/by-puuid/${puuid}/ids?count=${count}`;
    const url = buildProxyUrl(region, endpoint, true); // Regional endpoint
    
    return await riotFetch(url);
}

/**
 * Lấy chi tiết một match
 * Get match details
 * @param {string} matchId - Match ID
 * @param {string} region - Region code
 * @returns {Promise<Object>} Match data
 */
export async function getTftMatchDetails(matchId, region = 'VN2') {
    const endpoint = `/tft/match/v1/matches/${matchId}`;
    const url = buildProxyUrl(region, endpoint, true); // Regional endpoint
    
    return await riotFetch(url);
}

// ============================================
// AGGREGATED PROFILE FUNCTION
// ============================================

/**
 * Lấy full profile từ Riot API
 * Get full profile from Riot API (combines all APIs)
 * @param {Object} ign - Player info { region, gameName, tagLine, displayName }
 * @returns {Promise<Object>} Full profile data
 */
export async function getFullRiotProfile(ign) {
    try {
        // Decode URL-encoded game name
        const decodedGameName = decodeURIComponent(ign.gameName);
        
        // Step 1: Get account info (puuid)
        const account = await getAccountByRiotId(decodedGameName, ign.tagLine, ign.region);
        
        // Step 2: Get summoner info
        const summoner = await getSummonerByPuuid(account.puuid, ign.region);
        
        // Step 3: Get ranked info using summonerId (not puuid)
        // Note: Some regions (VN2, etc.) may not return summoner.id
        let rankedInfo = null;
        try {
            if (summoner.id) {
                const leagueEntries = await getTftLeagueEntries(summoner.id, ign.region);
                // Find TFT ranked entry (RANKED_TFT)
                rankedInfo = leagueEntries.find(entry => entry.queueType === 'RANKED_TFT') || leagueEntries[0];
            } else {
                console.warn('Summoner ID not available for this region. League data unavailable.');
            }
        } catch (e) {
            console.warn('Could not fetch ranked info:', e.message);
        }
        
        // Step 4: Get match history
        let matches = [];
        try {
            const matchIds = await getTftMatchIds(account.puuid, ign.region, 20);
            
            // Fetch details for first 5 matches (to avoid rate limiting)
            const matchDetailsPromises = matchIds.slice(0, 5).map(id => 
                getTftMatchDetails(id, ign.region).catch(e => null)
            );
            const matchDetails = await Promise.all(matchDetailsPromises);
            
            // Extract placement for each match
            matches = matchIds.map((matchId, index) => {
                const details = matchDetails[index];
                if (!details) {
                    return { match_id: matchId, placement: null };
                }
                
                // Find participant data for this player
                const participant = details.info?.participants?.find(p => p.puuid === account.puuid);
                
                return {
                    match_id: matchId,
                    placement: participant?.placement || null,
                    game_datetime: details.info?.game_datetime || null,
                    game_length: details.info?.game_length || null,
                    traits: participant?.traits || [],
                    units: participant?.units || [],
                    level: participant?.level || null,
                    augments: participant?.augments || []
                };
            });
        } catch (e) {
            console.warn('Could not fetch match history:', e.message);
        }
        
        // Build normalized profile object (compatible with MetaTFT format)
        const profile = {
            summoner: {
                riot_id: `${account.gameName}#${account.tagLine}`,
                puuid: account.puuid,
                summoner_id: summoner.id,
                summoner_level: summoner.summonerLevel,
                profile_icon_id: summoner.profileIconId
            },
            ranked: rankedInfo ? {
                tier: rankedInfo.tier,
                rank: rankedInfo.rank,
                league_points: rankedInfo.leaguePoints,
                wins: rankedInfo.wins,
                losses: rankedInfo.losses,
                rating_text: `${rankedInfo.tier} ${rankedInfo.rank}`,
                rating_numeric: calculateRatingNumeric(rankedInfo),
                num_games: rankedInfo.wins + rankedInfo.losses
            } : {
                tier: 'UNRANKED',
                rank: '',
                league_points: 0,
                wins: 0,
                losses: 0,
                rating_text: 'Unranked',
                rating_numeric: 0,
                num_games: 0
            },
            matches: matches
        };
        
        // Save to store for AI analysis
        riotProfileDataStore[ign.displayName] = profile;
        
        return { success: true, data: profile, ign, source: 'riot' };
        
    } catch (error) {
        console.error('Riot API error:', error);
        return { success: false, error: error.message, ign, source: 'riot' };
    }
}

/**
 * Tính rating numeric từ tier/rank
 * Calculate numeric rating from tier/rank
 * @param {Object} rankedInfo - Ranked info object
 * @returns {number} Numeric rating
 */
function calculateRatingNumeric(rankedInfo) {
    const tierValues = {
        'IRON': 0,
        'BRONZE': 400,
        'SILVER': 800,
        'GOLD': 1200,
        'PLATINUM': 1600,
        'EMERALD': 2000,
        'DIAMOND': 2400,
        'MASTER': 2800,
        'GRANDMASTER': 3200,
        'CHALLENGER': 3600
    };
    
    const rankValues = {
        'IV': 0,
        'III': 100,
        'II': 200,
        'I': 300
    };
    
    const tierValue = tierValues[rankedInfo.tier] || 0;
    const rankValue = rankValues[rankedInfo.rank] || 0;
    const lpValue = rankedInfo.leaguePoints || 0;
    
    // Master+ don't have ranks, just LP
    if (['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(rankedInfo.tier)) {
        return tierValue + lpValue;
    }
    
    return tierValue + rankValue + lpValue;
}

/**
 * Fetch profile wrapper (compatible with existing code)
 * @param {Object} ign - Player info object
 * @returns {Promise<Object>} Result object
 */
export async function fetchRiotProfile(ign) {
    return await getFullRiotProfile(ign);
}
