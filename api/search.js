exports.handler = async (event, context) => {
  try {
    const query = event.queryStringParameters?.query || 'trending deals';
    console.log(`[Search API] Searching for: "${query}"`);

    // Safe mock shopping results matching eBay & Vinted bargains
    const mockResults = [
      {
        title: `${query} (Budget Alternative / Thrift Find)`,
        price: "£14.99",
        source: "Vinted",
        link: "https://www.vinted.co.uk",
        thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"
      },
      {
        title: `Vintage Style ${query} - Great Condition`,
        price: "£22.50",
        source: "eBay",
        link: "https://www.ebay.co.uk",
        thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300"
      },
      {
        title: `Unbranded Dupe of ${query} Deal`,
        price: "£9.99",
        source: "eBay",
        link: "https://www.ebay.co.uk",
        thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300"
      }
    ];

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        shopping: mockResults
      })
    };
  } catch (error) {
    console.error("API Crash Error:", error);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        shopping: []
      })
    };
  }
};
