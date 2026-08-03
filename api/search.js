export default async function handler(req, res) {
  const { query, category, gender, size } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const serperHeaders = {
      'X-API-KEY': process.env.SERPAPI_KEY,
      'Content-Type': 'application/json'
    };

    // Clean exact specs from query so Google Shopping doesn't break
    let cleanedQuery = query
      .replace(/eur\s*\d+(\.\d+)?/gi, '')
      .replace(/size\s*\d+(\.\d+)?/gi, '')
      .replace(/uk\s*\d+(\.\d+)?/gi, '')
      .replace(/us\s*\d+(\.\d+)?/gi, '')
      .trim();

    if (!cleanedQuery) cleanedQuery = query;

    let fullQuery = cleanedQuery;
    if (gender) fullQuery += ` ${gender}`;
    if (category) fullQuery += ` ${category}`;
    if (size) fullQuery += ` size ${size}`;

    // Parallel calls to grab general shopping + direct eBay listings
    const [standardRes, ebayRes, directEbayRes] = await Promise.all([
      fetch(`https://google.serper.dev/shopping`, {
        method: 'POST',
        headers: serperHeaders,
        body: JSON.stringify({ q: fullQuery, num: 100 })
      }),
      fetch(`https://google.serper.dev/shopping`, {
        method: 'POST',
        headers: serperHeaders,
        body: JSON.stringify({ q: `site:ebay.com ${fullQuery}`, num: 100 })
      }),
      // Raw string search to catch exact individual eBay listings
      fetch(`https://google.serper.dev/shopping`, {
        method: 'POST',
        headers: serperHeaders,
        body: JSON.stringify({ q: `ebay ${query}`, num: 100 })
      })
    ]);

    const standardData = await standardRes.json();
    const ebayData = await ebayRes.json();
    const directEbayData = await directEbayRes.json();

    const combined = [
      ...(ebayData.shopping || []),
      ...(directEbayData.shopping || []),
      ...(standardData.shopping || [])
    ];

    // Deduplicate by link or title
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
