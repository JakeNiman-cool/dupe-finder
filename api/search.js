// Example backend route update in server.js
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.query || 'trending deals';
    
    // Call your shopping scraper / Google Shopping API wrapper with a high limit to get more items
    const results = await fetchShoppingResults(query, { num: 40 }); 

    res.json({
      success: true,
      shopping: results || []
    });
  } catch (error) {
    console.error("Search API Error:", error);
    res.status(500).json({ success: false, shopping: [] });
  }
});
