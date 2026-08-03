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
        body: JSON.stringify({ error: 'SERPAPI_KEY is missing on Netlify' }),
      };
    }

    // Direct Google Shopping Request via SerpApi
    const response = await fetch(
      `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(query)}&api_key=${apiKey}`
    );

    const data = await response.json();

    // Check if SerpApi returned an explicit account or request error
    if (data.error) {
      console.error('SerpApi returned an error:', data.error);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `SerpApi Error: ${data.error}` }),
      };
    }

    const shoppingResults = data.shopping_results || [];

    const cleanedResults = shoppingResults.map(item => ({
      title: item.title || 'Product Alternative',
      price: item.extracted_price || item.price || 'Check Store',
      formattedPrice: item.price || (item.extracted_price ? `$${item.extracted_price}` : 'See Store'),
      link: item.link || '#',
      image: item.thumbnail || item.image || 'https://via.placeholder.com/150',
      source: item.source || 'Store'
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ results: cleanedResults }),
    };
  } catch (error) {
    console.error('Function Execution Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Failed to fetch search results' }),
    };
  }
};
