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

    // Single robust call with "temu" explicitly built into the search intent keyword
    const response = await fetch(`https://google.serper.dev/shopping`, {
      method: 'POST',
      headers: serperHeaders,
      body: JSON.stringify({ q: `${fullQuery} temu`, num: 100 })
    });

    const data = await response.json();
    const uniqueItems = data.shopping || [];

    return res.status(200).json({ shopping: uniqueItems });
  } catch (error) {
    console.error("[Search API Error]:", error);
    return res.status(500).json({ error: 'Failed to fetch deals' });
  }
}
