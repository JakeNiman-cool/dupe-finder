export default async function handler(req, res) {
  try {
    const query = req.query.query || 'trending deals';
    console.log(`[Vercel Search API] Fetching wide results for: "${query}"`);

    // Fetch open shopping and general results without site restrictions
    const encodedQuery = encodeURIComponent(`${query} buy online cheap deal`);
    const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodedQuery}`);
    const htmlText = await response.text();

    const results = [];
    const regex = /<a class="result__url" href="([^"]+)"[^>]*>(.*?)<\/a>.*?<a class="result__snippet"[^>]*>(.*?)<\/a>/gs;
    let match;

    while ((match = regex.exec(htmlText)) && results.length < 30) {
      const link = match[1];
      const title = match[2].replace(/<[^>]*>?/gm, '').trim();
      const snippet = match[3].replace(/<[^>]*>?/gm, '').trim();

      const priceMatch = snippet.match(/(?:£|\$|€)\d+(?:\.\d{2})?/);
      const price = priceMatch ? priceMatch[0] : 'Check site';

      let source = 'Web Deal';
      const lowerLink = link.toLowerCase();
      if (lowerLink.includes('ebay')) source = 'eBay';
      else if (lowerLink.includes('vinted')) source = 'Vinted';
      else if (lowerLink.includes('amazon')) source = 'Amazon';
      else if (lowerLink.includes('etsy')) source = 'Etsy';
      else if (lowerLink.includes('depop')) source = 'Depop';
      else {
        try {
          const urlObj = new URL(link.startsWith('http') ? link : `https://${link}`);
          source = urlObj.hostname.replace('www.', '').split('.')[0];
          source = source.charAt(0).toUpperCase() + source.slice(1);
        } catch {
          source = 'Online Store';
        }
      }

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

    const finalShopping = results.length > 0 ? results : [
      {
        title: `Explore global listings for ${query}`,
        price: "Check web",
        source: "Aggregator",
        link: `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
        thumbnail: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300"
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
