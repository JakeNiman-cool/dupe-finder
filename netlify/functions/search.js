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

    // 1. Try Google Shopping first
    let response = await fetch(
      `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(query)}&api_key=${apiKey}`
    );
    let data = await response.json();
    let shoppingResults = data.shopping_results || [];

    // 2. Fallback: If 0 shopping results, search general Google for store/dupe links
    if (shoppingResults.length === 0) {
      const fallbackQuery = `${query} dupe alternative buy`;
      response = await fetch(
        `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(fallbackQuery)}&api_key=${apiKey}`
      );
      data = await response.json();
      
      // Map organic search results to fit your UI format
      const organicResults = data.organic_results || [];
      shoppingResults = organicResults.map(item => ({
        title: item.title,
        price: item.rich_snippet?.top?.detected_extensions?.price || 'Check Store',
        link: item.link,
        thumbnail: item.thumbnail || 'https://via.placeholder.com/150?text=No+Image',
        source: item.displayed_link || 'Web Result'
      }));
    }

    // Clean and standardise results for your frontend
    const cleanedResults = shoppingResults.map(item => ({
      title: item.title,
      price: item.extracted_price || item.price,
      formattedPrice: typeof item.price === 'number' ? `$${item.price}` : item.price,
      link: item.link,
      image: item.thumbnail || item.image,
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
