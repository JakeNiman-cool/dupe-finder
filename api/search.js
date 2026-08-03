exports.handler = async (event, context) => {
  try {
    const query = event.queryStringParameters?.query || 'trending deals';
    console.log(`[Search API] Fetching deals for query: "${query}"`);

    // Safe execution or fallback for shopping data
    let results = [];
    if (typeof fetchShoppingResults === 'function') {
      results = await fetchShoppingResults(query, { num: 40 });
    }

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

    // Forces clean JSON response instead of an HTML crash page
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
