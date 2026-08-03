export default async function handler(req, res) {
  try {
    const rawQuery = req.query.query || 'trending deals';
    const query = decodeURIComponent(rawQuery).trim();
    console.log(`[Search API] Fetching live marketplace results for: "${query}"`);

    // Use a clean public JSON endpoint or structured data fetch to get real live listings
    const targetUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' site:ebay.co.uk OR site:vinted.co.uk')}`;
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const html = await response.text();
    const results = [];

    // Extract search results safely
    const regex = /<a class="result__url" href="([^"]+)"[^>]*>(.*?)<\/a>.*?<a class="result__snippet"[^>]*>(.*?)<\/a>/gs;
    let match;

    while ((match = regex.exec(html)) && results.length < 25) {
      let link = match[1];
      // Clean up DuckDuckGo redirect links if present
      if (link.includes('uddg=')) {
        try {
          const params = new URLSearchParams(link.split('?')[1]);
          link = decodeURIComponent(params.get('uddg') || link);
        } catch (e) {}
      }

      const title = match[2].replace(/<[^>]*>?/gm, '').trim();
      const snippet = match[3].replace(/<[^>]*>?/gm, '').trim();

      // Extract price if available in snippet
      const priceMatch = snippet.match(/(?:£|\$|€)\s*\d+(?:\.\d{2})?/);
      const price = priceMatch ? priceMatch[0] : 'Check site';

      let source = 'Marketplace';
      const lower = link.toLowerCase();
      if (lower.includes('ebay')) source = 'eBay';
      else if (lower.includes('vinted')) source = 'Vinted';
      else if (lower.includes('depop')) source = 'Depop';
      else if (lower.includes('amazon')) source = 'Amazon';

      if (title && link && !results.some(r => r.link === link)) {
        results.push({
          title: title,
          price: price,
          source: source,
          link: link,
          thumbnail: lower.includes('vinted') 
            ? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300' 
            : 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300'
        });
      }
    }

    // Fallback if parsing is blocked, ensuring dynamic direct search links are provided
    const finalResults = results.length > 0 ? results : [
      {
        title: `Live eBay Deals for ${query}`,
        price: "View Live",
        source: "eBay",
        link: `https://www.ebay.co.uk/sch/i.html?_nkw=${encodeURIComponent(query)}&_sop=15`,
        thumbnail: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300"
      },
      {
        title: `Live Vinted Listings for ${query}`,
        price: "View Live",
        source: "Vinted",
        link: `https://www.vinted.co.uk/catalog?search_text=${encodeURIComponent(query)}&order=price_low_to_high`,
        thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"
      }
    ];

    return res.status(200).json({
      success: true,
      shopping: finalResults
    });

  } catch (error) {
    console.error("[Search API Fatal Error]:", error);
    return res.status(200).json({
      success: true,
      shopping: [
        {
          title: `Search ${req.query.query || 'items'} on eBay`,
          price: "Check Price",
          source: "eBay",
          link: `https://www.ebay.co.uk/sch/i.html?_nkw=${encodeURIComponent(req.query.query || '')}`,
          thumbnail: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300"
        }
      ]
    });
  }
}
