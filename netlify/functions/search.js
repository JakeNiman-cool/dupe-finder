exports.handler = async function (event, context) {
  const query = event.queryStringParameters ? event.queryStringParameters.q : null;

  if (!query) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Query parameter "q" is required' }),
    };
  }

  try {
    const apiKey = process.env.SERPAPI_KEY;

    if (!apiKey) {
      console.error('SERPAPI_KEY is missing from environment variables');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API key configuration issue' }),
      };
    }

    // Standard SerpApi Google Shopping Request
    const response = await fetch(
      `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(query)}&api_key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`SerpApi network response was not ok: ${response.status}`);
    }

    const data = await response.json();
    const shoppingResults = data.shopping_results || [];

    // Safe formatting with fallback checks so it never crashes
    const cleanedResults = shoppingResults.map(item => ({
      title: item.title || 'Product',
      price: item.extracted_price || item.price || 'Check Price',
      formattedPrice: item.price || (item.extracted_price ? `$${item.extracted_price}` : 'See Store'),
      link: item.link || '#',
      image: item.thumbnail || item.image || 'https://via.placeholder.com/150',
      source: item.source || 'Online Store'
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ results: cleanedResults }),
    };
  } catch (error) {
    console.error('SerpApi Error:', error.message || error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch search results' }),
    };
  }
};
