exports.handler = async (event, context) => {
  try {
    // Get query parameters safely from Netlify's event object
    const query = event.queryStringParameters?.query || 'trending deals';
    console.log(`[Search API] Fetching deals for query: "${query}"`);

    let results = [];
    if (typeof fetchShoppingResults === 'function') {
      results = await fetchShoppingResults(query, { num: 40 });
    }

    // Netlify functions must return an object with statusCode and stringified body
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        shopping: Array.isArray(results) ? results : []
      })
    };
  } catch (error) {
    console.error("[Search API Error]:", error);

    // Always return valid JSON even during failures
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        shopping: []
      })
    };
  }
};
