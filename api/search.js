exports.handler = async (event, context) => {
  try {
    const query = event.queryStringParameters?.query || 'trending deals';
    
    // Perform search/scraping securely
    let results = [];
    if (typeof fetchShoppingResults === 'function') {
      results = await fetchShoppingResults(query);
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        shopping: Array.isArray(results) ? results : []
      })
    };
  } catch (error) {
    console.error("API Error:", error);
    // Return valid JSON even if it fails, preventing frontend syntax crashes
    return {
      statusCode: 200, // Return 200 with empty array so frontend parses successfully
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        shopping: []
      })
    };
  }
};
