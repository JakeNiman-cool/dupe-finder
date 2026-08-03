export default async function handler(req, res) {
  try {
    const query = req.query.query || 'trending deals';
    console.log(`[Search API] Generating dynamic results for: "${query}"`);

    const cleanQuery = encodeURIComponent(query);

    // Dynamically generate wide-ranging real marketplace results based on what the user typed
    const dynamicResults = [
      {
        title: `Cheap ${query} Listings & Auctions`,
        price: "From £1.00",
        source: "eBay",
        link: `https://www.ebay.co.uk/sch/i.html?_nkw=${cleanQuery}&_sop=15`,
        thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"
      },
      {
        title: `Secondhand & Vintage ${query} Deals`,
        price: "Best Offer",
        source: "Vinted",
        link: `https://www.vinted.co.uk/catalog?search_text=${cleanQuery}&order=price_low_to_high`,
        thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300"
      },
      {
        title: `Pre-loved & Thrifty ${query} Finds`,
        price: "Check site",
        source: "Depop",
        link: `https://www.depop.com/search/?q=${cleanQuery}`,
        thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300"
      },
      {
        title: `Discounted ${query} Online Offers`,
        price: "Compare",
        source: "Google Shopping",
        link: `https://www.google.com/search?tbm=shop&q=${cleanQuery}`,
        thumbnail: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300"
      },
      {
        title: `Affordable Alternative / Budget Style ${query}`,
        price: "Low Price",
        source: "Amazon",
        link: `https://www.amazon.co.uk/s?k=${cleanQuery}`,
        thumbnail: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300"
      }
    ];

    return res.status(200).json({
      success: true,
      shopping: dynamicResults
    });
  } catch (error) {
    console.error("[Search API Error]:", error);
    return res.status(200).json({
      success: false,
      shopping: []
    });
  }
}
