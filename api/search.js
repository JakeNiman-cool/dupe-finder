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

    let baseQuery = cleanedQuery;
    if (gender) baseQuery += ` ${gender}`;
    if (category) baseQuery += ` ${category}`;
    if (size) baseQuery += ` size ${size}`;

    // Execute parallel searches targeting mainstream shopping + budget marketplaces explicitly
    const [standardRes, temuRes, aliexpressRes, etsyRes] = await Promise.all([
      fetch(`https://google.serper.dev/shopping`, {
        method: 'POST',
        headers: serperHeaders,
        body: JSON.stringify({ q: baseQuery, num: 40 })
      }),
      fetch(`https://google.serper.dev/shopping`, {
        method: 'POST',
        headers: serperHeaders,
        body: JSON.stringify({ q: `${baseQuery} temu`, num: 30 })
      }),
      fetch(`https://google.serper.dev/shopping`, {
        method: 'POST',
        headers: serperHeaders,
        body: JSON.stringify({ q: `${baseQuery} aliexpress`, num: 30 })
      }),
      fetch(`https://google.serper.dev/shopping`, {
        method: 'POST',
        headers: serperHeaders,
        body: JSON.stringify({ q: `${baseQuery} etsy`, num: 20 })
      })
    ]);

    const standardData = await standardRes.json();
    const temuData = await temuRes.json();
    const aliexpressData = await aliexpressRes.json();
    const etsyData = await etsyRes.json();

    // Combine all results, putting budget sources closer to the top
    const combined = [
      ...(temuData.shopping || []),
      ...(aliexpressData.shopping || []),
      ...(etsyData.shopping || []),
      ...(standardData.shopping || [])
    ];

    // Deduplicate by link or title so items don't repeat
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
