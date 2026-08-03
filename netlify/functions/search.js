exports.handler = async function (event, context) {
  const query = event.queryStringParameters.q;

  if (!query) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Query parameter "q" is required' }),
    };
  }

  try {
    const apiKey = process.env.SERPAPI_KEY;

    // Use native fetch to hit SerpApi with Google Shopping parameters
    const response = await fetch(
      `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(query)}&api_key=${apiKey}&gl=us&hl=en&direct_link=true`
    );

    if (!response.ok) {
      throw new Error(`SerpApi responded with status: ${response.status}`);
    }

    const data = await response.json();
    const shoppingResults = data.shopping_results || [];

    // Filter out irrelevant items lacking titles or prices
    const cleanedResults = shoppingResults
      .filter(item => item.title && item.price)
      .map(item => ({
        title: item.title,
        price: item.extracted_price || item.price,
        formattedPrice: item.price,
        link: item.link,
        image: item.thumbnail,
        source: item.source || 'Store',
      }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ results: cleanedResults }),
    };
  } catch (error) {
    console.error('SerpApi Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch search results' }),
    };
  }
};
