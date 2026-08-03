export default async function handler(req, res) {
  try {
    const query = req.query.query || 'trending deals';
    console.log(`[Vercel Search API] Fetching live results for: "${query}"`);

    // Fetch real shopping results using a public JSON search endpoint
    const encodedQuery = encodeURIComponent(`${query} site:ebay.co.uk OR site:vinted.co.uk`);
    const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodedQuery}`);
    const htmlText = await response.text();

    // Parse links and titles from duckduckgo html results as a lightweight fallback scraper
    const results = [];
    const regex = /<a class="result__url" href="([^"]+)"[^>]*>(.*?)<\/a>.*?<a class="result__snippet"[^>]*>(.*?)<\/a>/gs;
    let match;

    while ((match = regex.exec(htmlText)) && results.length < 20) {
      const link = match[1];
      const title = match[2].replace(/<[^>]*>?/gm, '').trim();
      const snippet = match[3].replace(/<[^>]*>?/gm, '').trim();

      // Try to extract a price from the snippet (e.g., £15.00 or $20)
      const priceMatch = snippet.match(/(?:£|\$|€)\d+(?:\.\d{2})?/);
      const price = priceMatch ? priceMatch[0] : 'Check site';

      let source = 'Web Deal';
      const lowerLink = link.toLowerCase();
      if (lowerLink.includes('ebay')) source = 'eBay';
      else if (lowerLink.includes('vinted')) source = 'Vinted';
      else if (lowerLink.includes('depop')) source = 'Depop';

      if (title && link) {
        results.push({
          title: title,
          price: price,
          source: source,
          link: link,
          thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'
        });
      }
    }

    // If scraping yields nothing, return helpful guidance items matching the query
    const finalShopping = results.length > 0 ? results : [
      {
        title: `Search results for ${query} on eBay`,
        price: "View Live",
        source: "eBay",
        link: `https://www.ebay.co.uk/sch/i.html?_nkw=${encodeURIComponent(query)}`,
        thumbnail: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300"
      },
      {
        title: `Search results for ${query} on Vinted`,
        price: "View Live",
        source: "Vinted",
        link: `https://www.vinted.co.uk/catalog?search_text=${encodeURIComponent(query)}`,
        thumbnail: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300"
      }
    ];

    return res.status(200).json({
      success: true,
      shopping: finalShopping
    });
  } catch (error) {
    console.error("[Search API Error]:", error);
    return res.status(200).json({
      success: false,
      shopping: []
    });
  }
}
