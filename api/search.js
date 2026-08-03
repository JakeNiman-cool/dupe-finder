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

    // Safely fetch standard results AND specific Temu results side-by-side
    const [standardRes, temuRes] = await Promise.all([
      fetch(`https://google.serper.dev/shopping`, {
        method: 'POST',
        headers: serperHeaders,
        body: JSON.stringify({ q: fullQuery, num: 60 })
      }),
      fetch(`https://google.serper.dev/shopping`, {
        method: 'POST',
        headers: serperHeaders,
        body: JSON.stringify({ q: `site:temu.com ${fullQuery}`, num: 40 })
      })
    ]);

    const standardData = await standardRes.json();
    const temuData = await temuRes.json();

    // Combine them safely (Temu items first so they show up prominently)
    const combined = [
      ...(temuData.shopping || []),
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
