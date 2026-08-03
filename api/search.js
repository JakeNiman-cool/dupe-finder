export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { query, size, gender } = req.method === 'POST' ? req.body : req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Clean query and apply negative keyword filtering to deprioritize accessories
    let cleanQuery = query.replace(/-case|-skin/gi, '').trim();
    if (size) cleanQuery += ` size ${size}`;
    if (gender) cleanQuery += ` ${gender}`;

    // Target marketplaces including Temu, Etsy, AliExpress, and eBay
    const platforms = [
      { name: 'EBAY', domain: 'ebay.com' },
      { name: 'TEMU', domain: 'temu.com' },
      { name: 'ETSY', domain: 'etsy.com' },
      { name: 'ALIEXPRESS', domain: 'aliexpress.com' }
    ];

    // Execute parallel requests to Google Serper Shopping API for each platform
    const fetchPromises = platforms.map(async (platform) => {
      try {
        const siteQuery = `site:${platform.domain} ${cleanQuery}`;
        const response = await fetch('https://google.serper.dev/shopping', {
          method: 'POST',
          headers: {
            'X-API-KEY': process.env.SERPER_API_KEY || '',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ q: siteQuery, gl: 'us', num: 4 })
        });

        const data = await response.json();
        const shoppingItems = data.shopping || [];

        return shoppingItems.map(item => ({
          title: item.title,
          price: item.price,
          link: item.link,
          thumbnail: item.thumbnail || 'favicon.png',
          sourcePlatform: platform.name,
          source: item.source || platform.name
        }));
      } catch (err) {
        console.error(`Error fetching from ${platform.name}:`, err);
        return [];
      }
    });

    const resultsArray = await Promise.all(fetchPromises);
    let allResults = resultsArray.flat();

    // Deal Score Ranking Logic: Prioritize items with price information and relevant titles
    allResults.sort((a, b) => {
      const priceA = parseFloat((a.price || '0').replace(/[^0-9.]/g, '')) || 999999;
      const priceB = parseFloat((b.price || '0').replace(/[^0-9.]/g, '')) || 999999;
      return priceA - priceB; // Low to high default ranking for maximum deal value
    });

    return res.status(200).json({ results: allResults });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error during deal hunting.' });
  }
}
