/**
 * Riot API Proxy Server
 * Proxy để bypass CORS và forward requests đến Riot API
 * Proxy to bypass CORS and forward requests to Riot API
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Riot API Proxy is running' });
});

/**
 * Proxy route cho Riot API
 * Format: /riot-proxy/:region/*
 * region có thể là: platform (vn2, na1, etc.) hoặc regional (sea, americas, europe, asia)
 */
app.all('/riot-proxy/:region/*', async (req, res) => {
    const { region } = req.params;
    const path = req.params[0]; // Phần còn lại của URL
    const apiKey = req.headers['x-riot-token'];
    
    if (!apiKey) {
        return res.status(401).json({ error: 'Missing X-Riot-Token header' });
    }
    
    // Determine base URL based on region
    let baseUrl;
    const regionalRoutes = ['sea', 'americas', 'europe', 'asia'];
    
    if (regionalRoutes.includes(region.toLowerCase())) {
        baseUrl = `https://${region.toLowerCase()}.api.riotgames.com`;
    } else {
        baseUrl = `https://${region.toLowerCase()}.api.riotgames.com`;
    }
    
    const targetUrl = `${baseUrl}/${path}${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`;
    
    console.log(`[Proxy] ${req.method} ${targetUrl}`);
    
    try {
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
                'X-Riot-Token': apiKey,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined
        });
        
        const data = await response.json().catch(() => ({}));
        
        // Forward rate limit headers
        res.set('X-Rate-Limit-Type', response.headers.get('X-Rate-Limit-Type'));
        res.set('Retry-After', response.headers.get('Retry-After'));
        
        res.status(response.status).json(data);
    } catch (error) {
        console.error('[Proxy Error]', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Riot API Proxy running on http://localhost:${PORT}`);
    console.log(`📖 Usage: http://localhost:${PORT}/riot-proxy/{region}/{api-path}`);
    console.log(`   Example: http://localhost:${PORT}/riot-proxy/sea/riot/account/v1/accounts/by-riot-id/TestName/Test`);
});
