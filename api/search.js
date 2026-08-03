export default async function handler(req, res) {
  // Grab query parameter 'q'
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Search query parameter "q" is required' });
  }

  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'SERPAPI_KEY is not configured on server' });
  }

  try {
    const response = await fetch('https://google.serper.dev/shopping', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: `${q} dupe alternative`,
        gl: 'us',
        hl: 'en'
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Serper API error:', error);
    return res.status(500).json({ error: 'Failed to communicate with Serper API' });
  }
}
