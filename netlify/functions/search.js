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

    // Direct, standard SerpApi Google Shopping call
    const response = await fetch(
      `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(query)}&api_key=${apiKey}`
    );

    const data = await response.json();

    // Log error directly to Netlify if SerpApi returns an account/key error
    if (data.error) {
      console.error('SerpApi returned error:', data.error);
    }

    const shoppingResults = data.shopping_results || [];

    const cleanedResults = shoppingResults.map(item => ({
      title: item.title,
      price: item.extracted_price || item.price,
      formattedPrice: item.price,
      link: item.link,
      image: item.thumbnail,
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
    console.error('SerpApi Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch search results' }),
    };
  }
};
