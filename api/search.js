exports.handler = async (event, context) => {
  try {
    const query = event.queryStringParameters?.query || 'trending deals';
    
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
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        shopping: []
      })
    };
  }
};
