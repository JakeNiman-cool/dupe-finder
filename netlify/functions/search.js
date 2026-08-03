exports.handler = async function (event, context) {
    // Extract query parameter from request URL
    const query = event.queryStringParameters.q;
    
    if (!query) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing search query parameter 'q'" })
        };
    }

    // SerpApi configuration
    const SERPAPI_KEY = "40840038eecafc31d5871a20df7f2c3eef586d4bacfde913665d9fd36aee7804";
    const targetUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(query + " dupe alternative")}&api_key=${SERPAPI_KEY}`;

    try {
        const response = await fetch(targetUrl);
        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" // Enables direct frontend access
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Serverless function failed to reach SerpApi" })
        };
    }
};