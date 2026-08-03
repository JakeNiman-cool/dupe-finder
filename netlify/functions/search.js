exports.handler = async function (event, context) {
  // Extract query parameter from request (e.g., /api/search?q=Nike)
  const query = event.queryStringParameters ? event.queryStringParameters.q : null;

  if (!query) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Query parameter "q" is required' }),
    };
  }

  try {
    // Reads your new Serper key from Netlify Environment Variables
    const apiKey = process.env.SERPAPI_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'API key missing in Netlify environment variables' }),
      };
    }

    // Call Serper.dev Google Shopping Endpoint
    const response = await fetch('https://google.serper.dev/shopping', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        gl: 'us',
        hl: 'en',
      }),
    });

    const data = await response.json();

    if (!response.ok || data.message) {
      return {
        statusCode: response.status || 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: data.message || 'Failed to fetch from Serper API' }),
      };
    }

    // Parse shopping results returned by Serper
    const shoppingResults = data.shopping || [];

    // Map and normalize fields so frontend app.js can display them smoothly
    const cleanedResults = shoppingResults.map(item => ({
      title: item.title || 'Alternative Product',
      price: item.price ? (typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : item.price) : 'Check Price',
      formattedPrice: item.price ? (typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : item.price) : 'Check Price',
      link: item.link || '#',
      image: item.imageUrl || 'https://via.placeholder.com/200?text=No+Image',
      source: item.source || 'Online Store',
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ results: cleanedResults }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: error.message || 'Internal Server Error' }),
    };
  }
};
