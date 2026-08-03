export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    // Keep search clean to fetch all major retail results directly from Google Shopping
    const searchQuery = `${query} price deal`;

    const response = await fetch(`https://google.serper.dev/shopping`, {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPAPI_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ q: searchQuery })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("[Search API Error]:", error);
    return res.status(500).json({ error: 'Failed to fetch deals' });
  }
}
