const axios = require('axios');

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

    // We pass strict parameters to Google Shopping to guarantee accuracy
    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google_shopping',
        q: query,
        api_key: apiKey,
        gl: 'us',           // Target location (e.g. 'us' or 'uk')
        hl: 'en',           // Language
        direct_link: true,  // Bypasses redirect links straight to real product pages
      },
    });

    const shoppingResults = response.data.shopping_results || [];

    // Filter out irrelevant items that lack a title or valid price
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
