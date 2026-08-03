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

    // Construct enriched search strings based on category, gender, and size
    let extendedQuery = query;
    if (gender) extendedQuery += ` ${gender}`;
    if (category) extendedQuery += ` ${category}`;
    if (size) extendedQuery += ` size ${size}`;

    // Parallel searches to grab raw deals, cheap ebay listings, and luxury options
    const [standardRes, ebayRes, cheapEbayRes] = await Promise.all([
      fetch(`https://google.serper.dev/shopping`, {
        method: 'POST',
        headers: serperHeaders,
        body: JSON.stringify({ q: extendedQuery, num: 100 })
      }),
      fetch(`https://google.serper.dev/shopping`, {
        method: 'POST',
        headers: serperHeaders,
        body: JSON.stringify({ q: `site:ebay.com ${extendedQuery}`, num: 100 })
      }),
      // Cheap/Bargain query to force ultra-low prices like $5 items
      fetch(`https://google.serper.dev/shopping`, {
        method: 'POST',
        headers: serperHeaders,
        body: JSON.stringify({ q: `site:ebay.com cheap deal ${extendedQuery}`, num: 100 })
      })
    ]);

    const standardData = await standardRes.json();
    const ebayData = await ebayRes.json();
    const cheapEbayData = await cheapEbayRes.json();

    const combined = [
      ...(standardData.shopping || []),
      ...(ebayData.shopping || []),
      ...(cheapEbayData.shopping || [])
    ];

    // Deduplicate items by link or title
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
