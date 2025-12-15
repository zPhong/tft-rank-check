/**
 * Google Gemini AI Service
 * Xử lý các cuộc gọi API đến Google Gemini
 * Handles API calls to Google Gemini
 */

import { GEMINI_API_URL } from '../config/constants.js';
import { getApiKey, getModel } from '../config/settings.js';

/**
 * Fetch danh sách models có sẵn từ Gemini
 * Fetch available models from Gemini
 * @returns {Promise<Array>} Array of model objects
 */
export async function fetchModels() {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('No API key configured');
    }

    const response = await fetch(`${GEMINI_API_URL}/models?key=${apiKey}`);
    const data = await response.json();

    if (data.error) {
        throw new Error(data.error.message);
    }

    // Lọc các models hỗ trợ generateContent
    // Filter models that support generateContent
    return data.models
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => m.name.replace('models/', ''));
}

/**
 * Gọi Gemini API để phân tích
 * Call Gemini API for analysis
 * @param {string} prompt - The prompt to send
 * @param {string} model - Model name to use
 * @returns {Promise<string>} Response text
 */
export async function callGeminiAPI(prompt, model) {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('No API key configured');
    }

    const response = await fetch(
        `${GEMINI_API_URL}/models/${model}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 4096
                }
            })
        }
    );

    const data = await response.json();
    console.log('API Response:', data);

    if (data.error) {
        throw new Error(data.error.message);
    }

    if (!data.candidates?.length) {
        throw new Error('No response from AI');
    }

    const text = data.candidates[0]?.content?.parts?.find(p => p.text)?.text;
    if (!text) {
        throw new Error('No text in response');
    }

    return text;
}

/**
 * Xây dựng prompt phân tích cho AI
 * Build analysis prompt for AI
 * @param {Object} data - Player data
 * @param {Array} matches - Matches to analyze
 * @param {string} currentPlayer - Current player display name
 * @returns {string} Complete prompt
 */
export function buildPrompt(data, matches, currentPlayer) {
    const stats = {
        count: matches.length,
        top4: matches.filter(m => m.placement <= 4).length,
        wins: matches.filter(m => m.placement === 1).length,
        avg: (matches.reduce((a, m) => a + m.placement, 0) / matches.length).toFixed(2)
    };
    
    // Phân tích chi tiết từng trận với các giai đoạn
    const matchData = matches.map((m, i) => {
        const units = m.summary?.units?.map(u => ({ 
            name: u.character_id.replace('TFT16_', ''), 
            tier: u.tier, 
            star_level: u.tier === 1 ? (u.rarity >= 3 ? 3 : u.rarity >= 2 ? 2 : 1) : 1,
            items: u.itemNames?.map(x => x.replace('TFT_Item_', '').replace('TFT16_Item_', '')) || []
        })) || [];
        
        // Xác định core champions
        const coreChamps = units.filter(u => u.tier >= 3 || (u.items && u.items.length >= 2));
        const itemHolders = units.filter(u => u.items && u.items.length > 0);
        
        // Phân tích upgrades
        const upgradedChamps = units.filter(u => {
            return (u.items && u.items.length >= 2) || u.tier >= 3;
        });
        
        // Phân tích early game
        const earlyChamps = units.filter(u => u.tier <= 2);
        const earlyTraits = m.summary?.traits?.filter(t => t.includes('TFT16_'))?.map(t => t.replace('TFT16_', '').split('_')[0]) || [];
        
        // Xác định opener type
        let openerType = 'Unknown';
        if (earlyTraits.includes('Bilgewater') || earlyChamps.some(c => ['Illaoi', 'Graves', 'Twisted Fate', 'Gangplank'].includes(c.name))) {
            openerType = 'Bilgewater Opener';
        } else if (earlyTraits.includes('Ionia') || earlyChamps.some(c => ['Briar', 'Jhin', 'Shen', 'Yasuo'].includes(c.name))) {
            openerType = 'Ionia Opener';
        } else if (earlyTraits.includes('Demacia') || earlyChamps.some(c => ['Jarvan IV', 'Lulu', 'Sona', 'Neeko'].includes(c.name))) {
            openerType = 'Demacia Opener';
        } else if (earlyTraits.includes('Noxus') || earlyChamps.some(c => ['Briar', 'Qiyana', 'Cho\'Gath', 'Sion'].includes(c.name))) {
            openerType = 'Noxus Opener';
        } else if (earlyTraits.includes('Freljord') || earlyChamps.some(c => ['Anivia', 'Ashe', 'Sejuani'].includes(c.name))) {
            openerType = 'Freljord Opener';
        } else if (earlyTraits.includes('Shadow Isles') || earlyChamps.some(c => ['Viego', 'Yorick'].includes(c.name))) {
            openerType = 'Shadow Isles Opener';
        }
        
        // Upgrade analysis
        const upgradeAnalysis = {
            upgraded_core: upgradedChamps.map(c => ({ 
                name: c.name, 
                tier: c.tier, 
                items: c.items,
                upgrade_priority: c.items && c.items.length >= 2 ? 'High' : 'Medium'
            })),
            potential_3_stars: units.filter(u => u.tier <= 2 && u.items && u.items.length > 0).map(c => c.name),
            upgrade_timing: m.summary?.level <= 7 ? 'Early upgrade' : m.summary?.level <= 8 ? 'Mid upgrade' : 'Late upgrade'
        };
        
        return {
            game: i + 1, 
            placement: m.placement,
            round: m.summary?.last_round, 
            level: m.summary?.level,
            opener: {
                type: openerType,
                starting_champs: earlyChamps.map(c => ({ name: c.name, tier: c.tier })),
                early_traits: earlyTraits.slice(0, 4),
                meta_alignment: openerType !== 'Unknown' ? 'Có opener rõ ràng' : 'Opener không rõ'
            },
            core_selection: {
                core_champions: coreChamps.map(c => ({ name: c.name, tier: c.tier, items: c.items })),
                item_distribution: itemHolders.map(h => ({ champ: h.name, items: h.items })),
                core_traits: m.summary?.traits?.map(t => t.replace('TFT16_', '').split('_')[0]) || [],
                upgrade_path: upgradeAnalysis
            },
            final_comp: {
                all_units: units.map(u => ({ name: u.name, tier: u.tier, items: u.items })),
                final_traits: earlyTraits,
                level: m.summary?.level,
                comp_strength: coreChamps.length >= 3 ? 'Strong' : coreChamps.length >= 2 ? 'Medium' : 'Weak'
            },
            transition: {
                from_opener: openerType,
                to_final: m.summary?.traits?.map(t => t.replace('TFT16_', '').split('_')[0]).join(', '),
                smoothness: coreChamps.length > 0 && openerType !== 'Unknown' ? 'Có transition' : 'Transition không rõ'
            }
        };
    });
    
    return `Bạn là chuyên gia TFT Challenger, coach có nhiều năm kinh nghiệm phân tích gameplay sâu. Tham khảo meta từ TFTFlow.com (https://tftflow.com/) cho Set 16.1.

## THUẬT NGỮ: Econ, Slow roll, Fast 8, Fast 9, Pivot, Cap board, Spike, BIS, Item holder, Core selection, Transition, Itemization, Opener, Upgrade path

## META REFERENCE (TFTFlow Set 16.1):
- **AD Core Lines**: Bilgewater Opener, Ionia Opener, Fast 8 comps (Freljord Yunara, Bilgewater Flex, Slayers)
- **AP Core Lines**: Demacia Opener → Fast 9 Arcanists, Noxus Opener → Fast 9 Mel Flex, Freljord/Ixtal → Fast 8
- **Key Strategies**: Bilgewater shop upgrades, Fast 9 transitions, Fast 8 top 4 lines
- **Opener Types**: Bilgewater (Illaoi/Graves/TF), Ionia (Briar/Jhin/Shen), Demacia (J4/Lulu/Sona), Noxus (Briar/Qiyana), Freljord (Anivia/Ashe)

## PLAYER: ${data.summoner?.riot_id || currentPlayer} (${data.ranked?.rating_text}) - ${data.ranked?.num_games} games

## STATS (${stats.count} games): Top4: ${((stats.top4 / stats.count) * 100).toFixed(1)}%, Avg: ${stats.avg}, Wins: ${stats.wins}

## MATCHES (với phân tích giai đoạn chi tiết):\n${JSON.stringify(matchData, null, 2)}

## PHÂN TÍCH CHUYÊN SÂU (giữ nguyên tên champion, item, trait gốc):

## 📊 OVERVIEW\n[Phân tích playstyle tổng thể, điểm mạnh/yếu, so sánh với meta TFTFlow]

## 🎮 OPENER & CHAMP KHỞI ĐẦU
Phân tích từng trận:
- **Opener type**: Có dùng opener đúng theo meta không? (Bilgewater/Ionia/Demacia/Noxus/Freljord)
- **Opener quality**: Opener có phù hợp với items nhận được không? (AD items → Bilgewater/Ionia, AP items → Demacia/Noxus)
- **Starting champions**: Champ khởi đầu có đúng theo opener không? Có giữ được winstreak/econ không?
- **Meta alignment**: So sánh với TFTFlow - opener có theo đúng meta lines không?

## 🎯 GIAI ĐOẠN CHỌN LÕI & NÂNG CẤP (CORE SELECTION & UPGRADES)
Phân tích từng trận:
- **Core champions được chọn**: 
  * Đánh giá việc chọn lõi có phù hợp với opener không?
  * Có pivot đúng lúc từ opener sang core không?
  * Core có match với meta lines từ TFTFlow không?
  
- **Upgrade Path & Timing**:
  * **Upgrade priority**: Champions nào được nâng cấp? Có đúng priority không?
  * **2-star upgrades**: Có nâng cấp đúng champs cần thiết không? Timing có đúng không?
  * **3-star potential**: Có cố gắng 3-star champs nào không? Có nên không?
  * **Upgrade timing**: Nâng cấp ở level nào? Có quá sớm hay quá muộn?
  
- **Item distribution**: 
  * Items được gán cho ai? Có BIS không?
  * Item holder có hiệu quả không?
  * So sánh với TFTFlow recommendations
  
- **Timing**: 
  * Chọn lõi ở round/level nào? 
  * Fast 8 vs Fast 9: Có chọn đúng strategy không?

## 🏁 GIAI ĐOẠN CHỐT ĐỘI HÌNH (FINAL COMP)
Phân tích từng trận:
- **Opener → Final comp transition**: Mượt mà hay gượng ép?
- **Starting champions → Final**: Champ khởi đầu có phù hợp để build lên comp cuối không?
- **Final board strength**: Đội hình cuối có đủ mạnh không?

## 🔍 BOT 4 ANALYSIS (Phân tích sâu từng trận 5-8)
Với mỗi trận bot 4, chỉ ra:
1. **Opener issues**: Opener sai?
2. **Core selection**: Chọn lõi sai?
3. **Upgrade problems**: Nâng cấp quá sớm/muộn?
4. **Transition issues**: Transition gượng ép?
5. **Timing issues**: Econ, leveling, rolling có đúng không?

## ❌ SAI LẦM CHÍNH (Từ data cụ thể)
1. **[Cụ thể]** - Dẫn chứng từ matches

## ✅ ĐIỂM MẠNH
- Những gì làm tốt

## 📚 KEY TAKEAWAYS (Tips actionable)
- Opener selection
- Core selection  
- Upgrade strategy
- Transition tips

## 🎯 ROADMAP
- Target rank
- Focus areas

## 💡 COMP RECOMMENDATIONS
Dựa trên playstyle, recommend comps phù hợp`;
}

/**
 * Format kết quả phân tích thành HTML
 * Format analysis result to HTML
 * @param {string} text - Raw AI response text
 * @param {string} name - Player name
 * @param {string} rank - Player rank
 * @param {number} count - Number of games analyzed
 * @param {string} currentPlayer - Current player for back button
 * @returns {string} Formatted HTML
 */
export function formatAnalysisResult(text, name, rank, count, currentPlayer) {
    let html = text
        .replace(/## (.*)/g, '<h2>$1</h2>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n- /g, '</li><li>')
        .replace(/\n(\d+)\. /g, '</li><li>');
    
    const escapedPlayer = currentPlayer.replace(/'/g, "\\'");
    
    return `
        <button class="btn btn-secondary" onclick="window.analysisModule.showAnalysisSetup('${escapedPlayer}')" style="margin-bottom:15px;">← Back</button>
        <div class="player-header"><strong>${name}</strong> - ${rank} (${count} games analyzed)</div>
        <div class="analysis-result"><p>${html}</p></div>
    `;
}
