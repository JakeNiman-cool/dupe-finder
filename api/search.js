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

    // Run parallel requests: standard query + luxury/high-end query
    const [standardRes, luxuryRes] = await Promise.all([
      fetch(`https://google.serper.dev/shopping`, {
        method: 'POST',
        headers: serperHeaders,
        body: JSON.stringify({ q: query, num: 100 })
      }),
      fetch(`https://google.serper.dev/shopping`, {
        method: 'POST',
        headers: serperHeaders,
        body: JSON.stringify({ q: `${query} luxury designer high end authentic`, num: 100 })
      })
    ]);

    const standardData = await standardRes.json();
    const luxuryData = await luxuryRes.json();

    const standardItems = standardData.shopping || [];
    const luxuryItems = luxuryData.shopping || [];

    // Combine both result sets
    const combined = [...standardItems, ...luxuryItems];

    // Remove duplicate items by link or title
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
