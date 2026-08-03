export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    // Send the user's raw query directly so Serper returns all major stores (Amazon, Wayfair, Target, etc.)
    const response = await fetch(`https://google.serper.dev/shopping`, {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPAPI_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ q: query })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("[Search API Error]:", error);
    return res.status(500).json({ error: 'Failed to fetch deals' });
  }
}
