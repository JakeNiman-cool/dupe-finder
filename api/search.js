exports.handler = async (event, context) => {
  try {
    const query = event.queryStringParameters?.query || 'trending deals';
    console.log(`[Search API] Processing search query: "${query}"`);

    // Clean mock results representing actual budget marketplace items (eBay & Vinted)
    const mockShoppingResults = [
      {
        title: `${query} - Great Condition Thrift Find`,
        price: "£12.50",
        source: "Vinted",
        link: "https://www.vinted.co.uk",
        thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"
      },
      {
        title: `Vintage Style ${query} Secondhand`,
        price: "£18.00",
        source: "eBay",
        link: "https://www.ebay.co.uk",
        thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300"
      },
      {
        title: `Affordable Alternative / Dupe for ${query}`,
        price: "£8.99",
        source: "eBay",
        link: "https://www.ebay.co.uk",
        thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300"
      }
    ];

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        shopping: mockShoppingResults
      })
    };
  } catch (error) {
    console.error("[Search API Error]:", error);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        shopping: []
      })
    };
  }
};
