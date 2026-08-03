export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const serperHeaders = {
      'X-API-KEY': process.env.SERPAPI_KEY,
      'Content-Type': 'application/json'
    };

    // Run 3 parallel fetches:
    // 1. Standard search
    // 2. High-end / luxury search
    // 3. Explicit eBay & secondhand search to guarantee high volume of resale listings
    const [standardRes, luxuryRes, ebayRes] = await Promise.all([
      fetch(`https://google.serper.dev/shopping`, {
        method: 'POST',
        headers: serperHeaders,
        body: JSON.stringify({ q: query, num: 100 })
      }),
      fetch(`https://google.serper.dev/shopping`, {
        method: 'POST',
        headers: serperHeaders,
        body: JSON.stringify({ q: `${query} luxury designer authentic`, num: 100 })
      }),
      fetch(`https://google.serper.dev/shopping`, {
        method: 'POST',
        headers: serperHeaders,
        body: JSON.stringify({ q: `site:ebay.com ${query}`, num: 100 })
      })
    ]);

    const standardData = await standardRes.json();
    const luxuryData = await luxuryRes.json();
    const ebayData = await ebayRes.json();

    const standardItems = standardData.shopping || [];
    const luxuryItems = luxuryData.shopping || [];
    const ebayItems = ebayData.shopping || [];

    // Combine all 3 sources
    const combined = [...standardItems, ...ebayItems, ...luxuryItems];

    // Remove duplicates while preserving unique eBay links
    const seenLinks = new Set();
    const uniqueItems = combined.filter(item => {
      const identifier = item.link || item.title;
      if (seenLinks.has(identifier)) return false;
      seenLinks.add(identifier);
      return true;
    });

    return res.status(200).json({ shopping: uniqueItems });
  } catch (error) {
    console.error("[Search API Error]:", error);
    return res.status(500).json({ error: 'Failed to fetch deals' });
  }
}
